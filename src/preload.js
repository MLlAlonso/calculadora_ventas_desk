const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Ejemplo: si quisieras un botón en el frontend para cerrar la app
});