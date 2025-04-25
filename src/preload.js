const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  network: {
    onStatusChange: (callback) => {
      ipcRenderer.on('network-status', (event, status) => callback(status))
    }
  }
})