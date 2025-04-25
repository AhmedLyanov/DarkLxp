import { app, BrowserWindow, Menu } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
if (started) {
  app.quit();
}const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800, 
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false, 
  });
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('network-status', navigator.onLine)
  })
  
  mainWindow.on('ready-to-show', () => {
    mainWindow.maximize();  
    mainWindow.show();    
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  Menu.setApplicationMenu(null);
  mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
  createWindow();

  app.on('online', () => {
    mainWindow.webContents.send('network-status', true)
  })
  
  app.on('offline', () => {
    mainWindow.webContents.send('network-status', false)
  })
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
