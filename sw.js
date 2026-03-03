const CACHE_NAME = 'rpgm-emu-v1';
let gameFiles = {};

self.addEventListener('install', (event) => {
    // Force SW to become active immediately
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'LOAD_GAME_FILES') {
        gameFiles = event.data.files; // Store the map as in-memory variable
        console.log('SW: Received ' + Object.keys(gameFiles).length + ' files');

        // Notify the client that we're done
        if (event.ports && event.ports[0]) {
            event.ports[0].postMessage({ success: true, count: Object.keys(gameFiles).length });
        }
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

    // If we request a directory, like game/fonts/ returning nothing
    return null;
}

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Only intercept requests for the virtual game path
    if (url.pathname.includes('/rpgm-game/')) {
        event.respondWith(
            (async () => {
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

                    return new Response('404 Not Found', { status: 404 });
                }
            })()
        );
    }
});
