const CACHE_NAME = 'rpgm-emu-v3';
let gameFiles = {};

const DB_NAME = 'RpgmEmulatorDB';
const STORE_NAME = 'FileStore';

function getDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (event) => {
            event.target.result.createObjectStore(STORE_NAME);
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveFilesToDB(files) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(files, 'gameFilesMap');
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function loadFilesFromDB() {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const request = tx.objectStore(STORE_NAME).get('gameFilesMap');
        request.onsuccess = () => resolve(request.result || {});
        request.onerror = () => reject(tx.error);
    });
}

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            await self.clients.claim();
            gameFiles = await loadFilesFromDB();
            console.log('SW: Restored ' + Object.keys(gameFiles).length + ' files from IDB.');
        })()
    );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'LOAD_GAME_FILES') {
        gameFiles = event.data.files;
        console.log('SW: Received ' + Object.keys(gameFiles).length + ' files, saving to IDB...');

        saveFilesToDB(gameFiles).then(() => {
            if (event.ports && event.ports[0]) {
                event.ports[0].postMessage({ success: true, count: Object.keys(gameFiles).length });
            }
        }).catch(err => {
            console.error('SW IDB Save Error:', err);
            // Fallback: still notify ready even if IDB failed, maybe memory will hold
            if (event.ports && event.ports[0]) {
                event.ports[0].postMessage({ success: true, count: Object.keys(gameFiles).length });
            }
        });
    }
});

function getFileByPath(path) {
    // Exact match
    if (gameFiles[path]) return gameFiles[path];

    // Path resolution
    const parts = path.split('/');
    if (parts[0] === '') parts.shift();
    if (parts[0] === 'rpgm-game') parts.shift();

    const tryPath = parts.join('/');
    if (gameFiles[tryPath]) return gameFiles[tryPath];

    // Default RPG Maker web output contains index.html
    // iOS might mess with cases sometimes, so fallback
    const lowerPath = tryPath.toLowerCase();
    for (const key in gameFiles) {
        if (key.toLowerCase() === lowerPath) {
            return gameFiles[key];
        }
    }

    // Fallback for Safari audio: if game requests .m4a but only .ogg exists
    if (lowerPath.endsWith('.m4a')) {
        const altPath = lowerPath.substring(0, lowerPath.length - 4) + '.ogg';
        for (const key in gameFiles) {
            if (key.toLowerCase() === altPath) {
                return gameFiles[key];
            }
        }
    }

    // Vice versa if requests .ogg but only .m4a exists
    if (lowerPath.endsWith('.ogg')) {
        const altPath = lowerPath.substring(0, lowerPath.length - 4) + '.m4a';
        for (const key in gameFiles) {
            if (key.toLowerCase() === altPath) {
                return gameFiles[key];
            }
        }
    }

    // Aggressive Deep Search Fallback
    // If the file is requested in the wrong folder (e.g. root instead of data/), let's just find ANY file with this name.
    const filenameMatch = lowerPath.split('/').pop();
    if (filenameMatch) {
        const sanitize = n => n.replace(/[^a-z0-9.]/gi, '');
        const sanitizedMatch = sanitize(filenameMatch);
        for (const key in gameFiles) {
            const keyFileName = key.toLowerCase().split('/').pop();
            if (sanitize(keyFileName) === sanitizedMatch) {
                console.warn('SW Aggressive Fallback mapped:', tryPath, '->', key);
                return gameFiles[key];
            }
        }
    }

    // If we request a directory, like game/fonts/ returning nothing
    return null;
}

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Only intercept requests for the virtual game path
    if (url.pathname.includes('/rpgm-game/')) {
        event.respondWith(
            (async () => {
                // Rescue from IDB if memory was wiped by Safari sleep
                if (Object.keys(gameFiles).length === 0) {
                    console.warn('SW: Memory wiped, retrieving from IndexedDB...');
                    gameFiles = await loadFilesFromDB().catch(() => ({}));
                    if (Object.keys(gameFiles).length === 0) {
                        return new Response('404 Not Found (MEMORY LOST)', { status: 404 });
                    }
                }

                // Find file in our memory map
                const pathParts = url.pathname.split('/rpgm-game/');
                const path = pathParts[pathParts.length - 1]; // Content after /rpgm-game/

                const file = getFileByPath(decodeURIComponent(path));

                if (file) {
                    // Create Response from File Blob
                    const responseHeaders = new Headers();

                    // Determine content type based on extension
                    let contentType = file.type;
                    if (!contentType) {
                        if (path.endsWith('.js')) contentType = 'application/javascript';
                        else if (path.endsWith('.html')) contentType = 'text/html';
                        else if (path.endsWith('.css')) contentType = 'text/css';
                        else if (path.endsWith('.json')) contentType = 'application/json';
                        else if (path.endsWith('.png')) contentType = 'image/png';
                        else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) contentType = 'image/jpeg';
                        else if (path.endsWith('.ogg')) contentType = 'audio/ogg';
                        else if (path.endsWith('.m4a')) contentType = 'audio/mp4';
                        else if (path.endsWith('.woff') || path.endsWith('.woff2')) contentType = 'font/woff2';
                        else if (path.endsWith('.txt')) contentType = 'text/plain';
                        else if (path.endsWith('.csv')) contentType = 'text/csv';
                        else contentType = 'application/octet-stream';
                    }

                    responseHeaders.set('Content-Type', contentType);

                    // Cache-Control to prevent browser from caching the blob URLs unexpectedly
                    responseHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate');

                    return new Response(file, {
                        status: 200,
                        headers: responseHeaders
                    });
                } else {
                    console.warn('SW: File not found in in-memory map:', path);

                    // Notify clients
                    self.clients.matchAll().then(clients => {
                        clients.forEach(client => {
                            client.postMessage({ type: 'MISSING_FILE', path: path });
                        });
                    });

                    return new Response('File Not Uploaded', { status: 404, statusText: "File Not Uploaded By User" });
                }
            })()
        );
    }
});
