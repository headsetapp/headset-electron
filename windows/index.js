if(require('electron-squirrel-startup')) return;

const electron = require('electron');
const defaultMenu = require('electron-default-menu');
const { NODE_ENV } = process.env;
const { version } = require('./package')
const path = require('path')
const Positioner = require('electron-positioner')
const { exec } = require('child_process')
const windowStateKeeper = require('electron-window-state');

const {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  dialog,
} = electron;

let win;
let player;
let willQuitApp = false;

const isDev = false;

const start = () => {
  let mainWindowState = windowStateKeeper()
  win = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: 391,
    height: 706,
    resizable: false,
    title: 'Headset',
    maximizable: false,
    titleBarStyle: 'hidden-inset',
    icon: `file://${__dirname}/Headset.ico`,
    frame: true
  });

  mainWindowState.manage(win);

  if (isDev) {
    win.loadURL('http://192.168.1.68:3000');
  } else {
    win.loadURL('https://danielravina.github.io/headset/app/');
  }

  win.webContents.on('did-finish-load', () => {
    if (player) return;

    player = new BrowserWindow({
      width: 285,
      height: 480,
      resizable: true,
      title: 'Headset - Player',
      maximizable: true,
    });

    positioner = new Positioner(player).move('bottomCenter')

    setTimeout(()=> {
      player.minimize();
    }, 2000)

    if (isDev) {
      player.loadURL('http://127.0.0.1:3001');
    } else {
      player.loadURL('http://danielravina.github.io/headset/player');
    }

    player.on('close', (e) => {
      if (win) {
        dialog.showErrorBox('Oops! 🤕', `Sorry, player window cannot be closed. You can only minimize it.`);
        e.preventDefault();
      } else {
        exec('taskkill /F /IM Headset.exe')
      }
    })

    win.webContents.executeJavaScript(`
      window.electronVersion = "v${version}"
    `)

    globalShortcut.register('MediaPlayPause', () => {
      if (win === null) return;
      win.webContents.executeJavaScript(`
        window.electronConnector.emit('play-pause')
      `)
    });

    globalShortcut.register('MediaNextTrack', () => {
      if (win === null) return;
      win.webContents.executeJavaScript(`
        window.electronConnector.emit('play-next')
      `)
    });

    globalShortcut.register('MediaPreviousTrack', () => {
      if (win === null) return;
      win.webContents.executeJavaScript(`
        window.electronConnector.emit('play-previous')
      `)
    });

    if (isDev) {
      win.webContents.openDevTools();
    }
  }); // end did-finish-load

  win.on('close', (e) => {
    win = null
    // after app closes in Win, the global shourtcuts are still up, disabling it here.
    globalShortcut.unregisterAll()
    player.close()
  });

  win.on('restore', (e) => {
    e.preventDefault();
    win.show();
  });
}; // end start

app.on('activate', () => win.show());
app.on('before-quit', () => willQuitApp = true);
app.on('ready', start);

app.on('browser-window-created',function(e,window) {
  window.setMenu(null);
});
/*
 * This is the proxy between the 2 windows.
 * it receives messages from a renderrer
 * and send them to the other renderrer
*/
ipcMain.on('win2Player', (e, args) => {
  if (isDev) { console.log('win2Player', args); }

  player.webContents.send('win2Player', args)
})

ipcMain.on('player2Win', (e, args) => {
  if (isDev) { console.log('player2Win', args); }

  try {
    win.webContents.send('player2Win', args)
  } catch(err) { /* window already closed */ }
})
