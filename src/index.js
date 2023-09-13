const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

if (require('electron-squirrel-startup')) {
    app.quit();
}

const createWindow = async () => {

    const mainWindow = new BrowserWindow({
        width: 1080,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    mainWindow.setMenu(null);


    // See existical's fix for this active Electron issue https://github.com/electron/electron/issues/31917#issuecomment-1061142818
    ipcMain.on('focus-fix', () => {
        mainWindow.blur();
        mainWindow.focus();
    });
};

app.on('ready', createWindow);

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