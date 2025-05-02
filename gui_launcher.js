const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { fork } = require('child_process');

let mainWindow;
let subprocess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 250,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('gui_index.html');
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.on('START_LISTENING', (event, zoomUrl) => {
    console.log('🚀 Received link from GUI:', zoomUrl);
    subprocess = fork(path.join(__dirname, 'puppeteer_transcript_grabber.js'), [zoomUrl], {
      stdio: 'inherit'
    });
  });

  ipcMain.on('EXPORT_TRANSCRIPT', () => {
    if (subprocess && subprocess.connected) {
      subprocess.send({ type: 'EXPORT_TRANSCRIPT' });
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});