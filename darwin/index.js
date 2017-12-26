const electron = require('electron');
const defaultMenu = require('electron-default-menu');
const isDev = require('electron-is-dev');
const { version } = require('./package');
const windowStateKeeper = require('electron-window-state');
const AutoUpdater = require('./lib/AutoUpdater')

const {
  app,
  BrowserWindow,
  globalShortcut,
  Menu,
  ipcMain,
  dialog,
  shell,
} = electron;

let win;
let player;
let willQuitApp = false;

const start = () => {
  const mainWindowState = windowStateKeeper();
  win = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: 375,
    height: 667,
    resizable: false,
    title: 'Headset',
    maximizable: false,
    titleBarStyle: 'hidden-inset',
    icon: `file://${__dirname}/Icon.icns`,
  });

  mainWindowState.manage(win);

  if (isDev) {
    win.loadURL('http://127.0.0.1:3000');
  } else {
    win.loadURL('https://danielravina.github.io/headset/app/');
  }
  
  new AutoUpdater({
    onBeforeQuit: () => { willQuitApp = true }
  })
  
  win.webContents.on('did-finish-load', () => {
    if (player) return;

    player = new BrowserWindow({
      width: 285,
      height: 440,
      resizable: true,
      title: 'Headset - Player',
      maximizable: true,
    });

    setTimeout(() => {
      player.minimize();
    }, 2000);

    if (isDev) {
      player.loadURL('http://127.0.0.1:3001');
    } else {
      player.loadURL('http://danielravina.github.io/headset/player');
    }

    player.on('close', (e) => {
      if (!willQuitApp) {
        dialog.showErrorBox('Oops! 🤕', 'Sorry, player window cannot be closed. You can only minimize it.');
        e.preventDefault();
      }
    });

    win.webContents.executeJavaScript(`
      window.electronVersion = "v${version}"
    `);

    globalShortcut.register('MediaPlayPause', () => {
      win.webContents.executeJavaScript(`
        window.electronConnector.emit('play-pause')
      `);
    });

    globalShortcut.register('MediaNextTrack', () => {
      win.webContents.executeJavaScript(`
        window.electronConnector.emit('play-next')
      `);
    });

    globalShortcut.register('MediaPreviousTrack', () => {
      win.webContents.executeJavaScript(`
        window.electronConnector.emit('play-previous')
      `);
    });

    if (isDev) {
      win.webContents.openDevTools();
      // player.webContents.openDevTools();
    }

    const menu = defaultMenu(app, shell);

    Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
  }); // end did-finish-load

  win.on('close', (e) => {
    if (willQuitApp) {
      // the user tried to quit the app
      player = null;
      win = null;
    } else {
      // the user only tried to close the win
      e.preventDefault();
      win.hide();
    }
  });

  win.on('restore', (e) => {
    e.preventDefault();
    win.show();
  });
}; // end start

app.on('activate', () => { win.show(); });
app.on('before-quit', () => { willQuitApp = true; });
app.on('ready', start);

/*
 * This is the proxy between the 2 windows.
 * it receives messages from a renderrer
 * and send them to the other renderrer
*/
ipcMain.on('win2Player', (e, args) => {
  if (isDev) { console.log('win2Player', args); }

  player.webContents.send('win2Player', args);
});

ipcMain.on('player2Win', (e, args) => {
  if (isDev) { console.log('player2Win', args); }

  try {
    win.webContents.send('player2Win', args);
  } catch (err) { /* window already closed */ }
});
