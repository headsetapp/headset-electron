const debug = require('debug');
const electron = require('electron');
const windowStateKeeper = require('electron-window-state');
const mprisService = require('./lib/mprisService.js');
const registerMediaKeys = require('./lib/registerMediaKeys.js');
const { version } = require('./package');

const logger = debug('headset');
const logPlayer2Win = debug('headset:player2Win');
const logWin2Player = debug('headset:win2Player');

const {
  app,
  BrowserWindow,
  ipcMain,
} = electron;

let win;
let player;

const isDev = (process.env.NODE_ENV === 'development');
logger('Running as developer: %o', isDev);

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  logger('Exiting, this is a second instance running');
  app.exit();
}

app.on('second-instance', () => {
  // Someone tried to run a second instance, we should focus our window.
  logger('Second instance of Headset found, focusing');
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

const start = () => {
  logger('Starting Headset');
  const mainWindowState = windowStateKeeper();

  win = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: 375,
    height: 667,
    resizable: false,
    title: 'Headset',
    maximizable: false,
    titleBarStyle: 'hiddenInset',
    icon: 'icon.png',
    frame: true,
  });

  mainWindowState.manage(win);

  if (isDev) {
    win.loadURL('http://127.0.0.1:3000');
  } else {
    win.loadURL('https://danielravina.github.io/headset/app/');
  }

  player = new BrowserWindow({
    width: 427,
    height: 300,
    minWidth: 427,
    minHeight: 300,
    title: 'Headset - Player',
  });

  win.webContents.on('did-finish-load', () => {
    logger('Main window finished loading');

    setTimeout(() => {
      try {
        player.minimize();
      } catch (err) {
        // swallow
      }
    }, 2000);

    if (isDev) {
      player.loadURL('http://lvh.me:3001');
    } else {
      player.loadURL('http://danielravina.github.io/headset/player-v2');
    }

    try {
      logger('Initializing MPRIS and registering MediaKeys');
      mprisService(win, player);
      registerMediaKeys(win);
    } catch (err) {
      console.error(err);
    }

    win.webContents.executeJavaScript(`
      window.electronVersion = "v${version}"
    `);

    if (isDev) {
      win.webContents.openDevTools();
    }
  }); // end did-finish-load

  player.webContents.on('did-finish-load', () => {
    logger('Player window finished loading');
    win.focus();
  });

  player.on('close', (e) => {
    if (win) {
      logger('Attempted to close Player window while Headset running');
      e.preventDefault();
    } else {
      logger('Closing Player window');
    }
  });

  win.on('close', () => {
    logger('Closing Headset');
    win = null;
    player.close();
  });

  win.on('restore', (e) => {
    e.preventDefault();
    win.show();
  });
}; // end start

app.on('activate', () => win.show());
app.on('ready', start);

app.on('window-all-closed', () => {
  logger.info('App is quitting');
  app.exit();
});

app.on('browser-window-created', (e, window) => {
  window.setMenu(null);
});

/*
 * This is the proxy between the 2 windows.
 * It receives messages from a renderer and send them to the other renderer
*/
ipcMain.on('win2Player', (e, args) => {
  logWin2Player('%O', args);

  player.webContents.send('win2Player', args);
});

ipcMain.on('player2Win', (e, args) => {
  logPlayer2Win('%o', args);

  try {
    win.webContents.send('player2Win', args);
  } catch (err) { /* window already closed */ }
});
