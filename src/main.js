const { app, BrowserWindow } = require('electron');
const path = require('path');
const { fork } = require('child_process');

let mainWindow;
let backendProcess;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true, 
        }
    });


    const frontendPath = path.join(process.resourcesPath, 'frontend', 'index.html');
    const backendPath = path.join(process.resourcesPath, 'backend', 'server.js');

    // Cargar el frontend
    mainWindow.loadFile(frontendPath);

    // Iniciar el backend (servidor Express)
    console.log(`Intentando iniciar el backend desde: ${backendPath}`);
    backendProcess = fork(backendPath);

    backendProcess.stdout.on('data', (data) => {
        console.log(`Backend stdout: ${data}`);
    });

    backendProcess.stderr.on('data', (data) => {
        console.error(`Backend stderr: ${data}`);
    });

    backendProcess.on('close', (code) => {
        console.log(`Backend cerrado con código: ${code}`);
    });

    // Manejar el cierre de la ventana principal
    mainWindow.on('closed', () => {
        mainWindow = null;
        if (backendProcess) {
            backendProcess.kill(); // Asegúrate de detener el proceso del backend
            console.log('Backend process killed.');
        }
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});