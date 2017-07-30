const electron = require('electron');
const defaultMenu = require('electron-default-menu');
const { NODE_ENV } = process.env;
const { version } = require('./package')
const path = require('path')
const { exec } = require('child_process')
const windowStateKeeper = require('electron-window-state');

const {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  dialog,
  nativeImage
} = electron;

let win;
let player;

const isDev = false;
console.log('HIHIHIH', __dirname + '/icon.png')
const start = () => {
  let mainWindowState = windowStateKeeper();

  win = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: 375,
    height: 667,
    resizable: false,
    title: 'Headset',
    maximizable: false,
    titleBarStyle: 'hidden-inset',
    icon:  __dirname + '/icon.png',
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
      height: 440,
      resizable: true,
      title: 'Headset - Player',
      icon: __dirname + '/icon.png',
      maximizable: true,
    });

    setTimeout(()=> {
      try {
        player.minimize();
      } catch(err) {
       // this prevents a js error if user closes the window too quickly.
      }
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
        player = null
        exec('kill -9 $(pgrep Headset) &> /dev/null')
      }
    })

    win.webContents.executeJavaScript(`
      window.electronVersion = "v${version}"
    `)

    globalShortcut.register('MediaPlayPause', () => {
      win.webContents.executeJavaScript(`
        window.electronConnector.emit('play-pause')
      `)
    });

    globalShortcut.register('MediaNextTrack', () => {
      win.webContents.executeJavaScript(`
        window.electronConnector.emit('play-next')
      `)
    });

    globalShortcut.register('MediaPreviousTrack', () => {
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
    player.close()
  });

  win.on('restore', (e) => {
    e.preventDefault();
    win.show();
  });
}; // end start

app.on('activate', () => win.show());
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
