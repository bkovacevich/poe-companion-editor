'use strict';

const {app, BrowserWindow, dialog} = require('electron');

let window;

function start() {
  window = new BrowserWindow({width: 672, height: 376, frame: false, backgroundColor: '#222222'});

  window.setMenu(null);

  window.loadURL(`file://${__dirname}/index.html`);

  // window.webContents.openDevTools();
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
