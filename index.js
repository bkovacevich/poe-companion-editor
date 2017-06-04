'use strict';

const {app, BrowserWindow, dialog} = require('electron');

let window;

function start() {
  window = new BrowserWindow({width: 800, height: 600});

  window.loadURL(`file://${__dirname}/main.html`);

  window.webContents.openDevTools();
}

app.on('ready', start);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (window == null) {
    start()
  }
});
