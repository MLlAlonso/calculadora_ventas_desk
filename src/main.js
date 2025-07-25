const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const { spawn } = require('node:child_process');

let mainWindow;
let backendProcess;

// Función para crear la ventana principal
const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false, 
            contextIsolation: true,
            enableRemoteModule: false
        },
    });
    mainWindow.loadFile(path.join(__dirname, '../frontend/index.html'));
};

// Iniciar el backend de Node.js como un proceso secundario
const startBackend = () => {
    const backendPath = path.join(__dirname, '../backend/server.js');
    console.log(`Intentando iniciar el backend desde: ${backendPath}`);

    backendProcess = spawn('node', [backendPath], {
        cwd: path.join(__dirname, '../backend'),
        stdio: ['pipe', 'pipe', 'pipe', 'ipc']
    });

    backendProcess.stdout.on('data', (data) => {
        console.log(`Backend stdout: ${data}`);
    });

    backendProcess.stderr.on('data', (data) => {
        console.error(`Backend stderr: ${data}`);
    });

    backendProcess.on('close', (code) => {
        console.log(`Backend process exited with code ${code}`);
        backendProcess = null;
    });

    backendProcess.on('error', (err) => {
        console.error('Failed to start backend process:', err);
        app.quit(); 
    });
};

// Detener el backend cuando la aplicación Electron se cierre
app.on('will-quit', () => {
    if (backendProcess && !backendProcess.killed) {
        console.log('Terminating backend process...');
        backendProcess.kill();
    }
});

// Eventos del ciclo de vida de la aplicación Electron
app.whenReady().then(() => {
    startBackend(); 
    // Retardo para dar tiempo al backend de iniciar
    setTimeout(() => {
        createWindow(); 
    }, 2000); 

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});