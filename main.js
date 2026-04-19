const { app, BrowserWindow } = require('electron');
const serve = require('electron-serve');
const path = require('path');

// This tells Electron to safely serve your static Next.js files when packaged
const appServe = app.isPackaged ? serve({ directory: 'out' }) : null;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
    },
icon: path.join(__dirname, 'icon.ico')
  });

  // Remove the default top menu bar (File, Edit, View, etc.)
  win.setMenuBarVisibility(false);

  if (app.isPackaged) {
    // If it's the final .exe, load the built Next.js files
    appServe(win).then(() => {
      win.loadURL('app://-');
    });
  } else {
    // If we are developing, load the local Next.js server
    win.loadURL('http://localhost:3000');
    // win.webContents.openDevTools(); // Uncomment this if you want to see the inspect element console!
  }
}

app.on('ready', () => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});