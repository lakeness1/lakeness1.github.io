const folderInput = document.getElementById('game-folder');
const statusText = document.getElementById('status-text');
const startBtn = document.getElementById('start-btn');
const uiLayer = document.getElementById('ui-layer');
const gameFrame = document.getElementById('game-frame');
const closeBtn = document.getElementById('close-game-btn');

let swRegistration = null;

// Register Service Worker
async function registerSW() {
    if ('serviceWorker' in navigator) {
        try {
            const regs = await navigator.serviceWorker.getRegistrations();
            for (let reg of regs) {
                // If it's an old version, unregister it
                if (!reg.active || reg.active.scriptURL.indexOf('sw.js?v=') === -1) {
                    await reg.unregister();
                }
            }
            // Use cache busting to make sure Safari downloads the new code
            swRegistration = await navigator.serviceWorker.register(`sw.js?v=${Date.now()}`, { scope: '/' });
            console.log('Service Worker registered with scope:', swRegistration.scope);

            // Wait for SW to be ready and active
            await navigator.serviceWorker.ready;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            statusText.textContent = 'Tristemente el navegador no soporta la ejecución offline requerida.';
            statusText.style.color = '#ff6b6b';
        }
    } else {
        statusText.textContent = 'Service Workers no están soportados en este navegador.';
        statusText.style.color = '#ff6b6b';
    }
}

// Handle folder selection
folderInput.addEventListener('change', async (event) => {
    const files = event.target.files;

    if (!files || files.length === 0) {
        statusText.textContent = 'No se seleccionó ninguna carpeta.';
        return;
    }

    startBtn.classList.add('hidden');
    startBtn.disabled = true;
    statusText.textContent = 'Procesando archivos...';

    // Verify if it is an RPG Maker project (look for index.html at root level or near it)
    // webkitRelativePath format is "FolderName/path/to/file.ext"
    let rootPath = null;
    let hasSystemJson = false;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Buscamos system.json, que SIEMPRE está en la carpeta data/ de RPG Maker
        if (file.name.toLowerCase() === 'system.json') {
            const pathParts = file.webkitRelativePath.split('/');
            if (pathParts.length >= 2 && pathParts[pathParts.length - 2].toLowerCase() === 'data') {
                hasSystemJson = true;
                pathParts.pop(); // quitar System.json
                pathParts.pop(); // quitar data
                let candidate = pathParts.join('/');
                if (candidate !== '') candidate += '/';
                rootPath = candidate;
                break;
            }
        }
    }

    if (!hasSystemJson) {
        statusText.textContent = 'No se encontró data/System.json. Asegúrate de seleccionar la carpeta base del juego (donde esté game.rmmzproject o la carpeta www) que contenga la carpeta data/.';
        statusText.style.color = '#ff6b6b';
        return;
    }

    const fileMap = {};
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let relativePath = file.webkitRelativePath;

        if (rootPath !== null && relativePath.startsWith(rootPath)) {
            relativePath = relativePath.substring(rootPath.length);
        } else {
            // Unlikely to happen if rootPath matches the base directory, 
            // but just in case, strip the first directory name if no rootPath matched perfectly.
            const parts = relativePath.split('/');
            if (parts.length > 1) {
                parts.shift();
                relativePath = parts.join('/');
            }
        }

        fileMap[relativePath] = file;
    }

    statusText.textContent = `Preparando ${Object.keys(fileMap).length} archivos...`;

    // Wait for the active service worker
    const activeSW = navigator.serviceWorker.controller || (swRegistration && swRegistration.active);

    if (!activeSW) {
        statusText.textContent = 'Service Worker no está listo. Recarga la página y vuelve a intentar.';
        return;
    }

    // Send files to the Service Worker
    try {
        await sendMessageToSW({
            type: 'LOAD_GAME_FILES',
            files: fileMap
        });

        statusText.textContent = '¡Juego listo para jugar!';
        statusText.style.color = '#51cf66';
        startBtn.classList.remove('hidden');
        startBtn.disabled = false;
    } catch (err) {
        console.error('Error sending files to SW:', err);
        statusText.textContent = 'Hubo un error al preparar los archivos.';
        statusText.style.color = '#ff6b6b';
    }
});

// Start button
startBtn.addEventListener('click', () => {
    // Hide UI
    uiLayer.classList.remove('active');

    // Show Iframe
    gameFrame.classList.remove('hidden');
    closeBtn.classList.remove('hidden');

    // Load virtual path where the SW serves the files
    // Use a unique query string to avoid caching issues on iframe reload
    gameFrame.src = `/rpgm-game/index.html?t=${Date.now()}`;

    // Focus the game after loading to allow keyboard/touch input
    setTimeout(() => {
        gameFrame.focus();
    }, 500);
});

// Close game button
closeBtn.addEventListener('click', () => {
    gameFrame.classList.add('hidden');
    closeBtn.classList.add('hidden');
    uiLayer.classList.add('active');
    gameFrame.src = 'about:blank'; // unload game
});

// Utility to send messages to SW and wait for response
function sendMessageToSW(message) {
    return new Promise((resolve, reject) => {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => {
            if (event.data.error) {
                reject(event.data.error);
            } else {
                resolve(event.data);
            }
        };

        const activeSW = navigator.serviceWorker.controller || swRegistration.active;
        if (activeSW) {
            activeSW.postMessage(message, [messageChannel.port2]);
        } else {
            reject('No active Service Worker found');
        }
    });
}

// Global missing file listener to help debug problems
const missingFilesContainer = document.createElement('div');
missingFilesContainer.style.position = 'fixed';
missingFilesContainer.style.top = '60px';
missingFilesContainer.style.left = '10px';
missingFilesContainer.style.zIndex = '9999';
missingFilesContainer.style.pointerEvents = 'none';
missingFilesContainer.style.display = 'flex';
missingFilesContainer.style.flexDirection = 'column';
missingFilesContainer.style.gap = '5px';
document.body.appendChild(missingFilesContainer);

navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'MISSING_FILE') {
        const p = document.createElement('div');
        p.style.color = '#ff6b6b';
        p.style.background = 'rgba(0,0,0,0.85)';
        p.style.padding = '8px 12px';
        p.style.borderRadius = '8px';
        p.style.fontFamily = 'monospace';
        p.style.fontSize = '12px';
        p.style.border = '1px solid #ff6b6b';
        p.textContent = `404 Mismatch: "${event.data.path}"`;
        missingFilesContainer.appendChild(p);

        console.error('File not found by emulator:', event.data.path);
        setTimeout(() => p.remove(), 12000);
    }
});

// Initialize
requestAnimationFrame(() => {
    registerSW();
});
