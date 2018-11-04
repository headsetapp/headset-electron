const electron = require('electron');
const windowStateKeeper = require('electron-window-state');
const squirrel = require('electron-squirrel-startup');
const AutoUpdater = require('headset-autoupdater');
const path = require('path');

const { version } = require('./package');
const headsetTray = require('./lib/headsetTray');
const logger = require('./lib/headset-logger');
const i18next = require('./lib/i18nextConfig');

const {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  Tray,
} = electron;

let win;
let player;
let tray;

const isDev = (process.env.NODE_ENV === 'development');
logger.info(`Running as developer: ${isDev}`);

// Allows to autoplay video, which is disabled in newer versions of Chrome
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

// Exit the app if it starts from squirrel
if (squirrel) app.exit();

// Quit if second instance found and focus window of first instance
if (!app.requestSingleInstanceLock()) app.exit();

app.on('second-instance', () => {
  logger('Second instance of Headset found');
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

const start = () => {
  logger.info('Starting Headset');
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
    useContentSize: true,
    icon: path.join(__dirname, 'icons', 'Headset.ico'),
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
    minWidth: 430,
    minHeight: 310,
    title: 'Headset - Player',
    icon: path.join(__dirname, 'icons', 'Headset.ico'),
  });

  new AutoUpdater();

  i18next.on('initialized', (options) => {
    logger.info(`i18next has been initialized with ${JSON.stringify(options, null, 2)}`);
  });

  tray = new Tray(path.join(__dirname, 'icons', 'Headset.ico'));
  i18next.on('loaded', () => {
    logger.info('i18next resources loaded');
    headsetTray(tray, win, player, i18next);
  });

  win.webContents.on('did-finish-load', () => {
    logger.info('Main window finished loading');

    setTimeout(() => {
      player.minimize();
    }, 2000);

    if (isDev) {
      player.loadURL('http://lvh.me:3001');
    } else {
      player.loadURL('http://danielravina.github.io/headset/player-v2');
    }

    win.webContents.executeJavaScript(`
      window.electronVersion = "v${version}"
    `);

    logger.info('Registering MediaKeys');
    globalShortcut.register('MediaPlayPause', () => {
      if (win === null) return;
      logger.info('Executing %o media key command', 'play-pause');
      win.webContents.executeJavaScript(`
        window.electronConnector.emit('play-pause')
      `);
    });

    globalShortcut.register('MediaNextTrack', () => {
      if (win === null) return;
      logger.info('Executing %o media key command', 'play-next');
      win.webContents.executeJavaScript(`
        window.electronConnector.emit('play-next')
      `);
    });

    globalShortcut.register('MediaPreviousTrack', () => {
      if (win === null) return;
      logger.info('Executing %o media key command', 'play-previous');
      win.webContents.executeJavaScript(`
        window.electronConnector.emit('play-previous')
      `);
    });

    if (isDev) {
      win.webContents.openDevTools();
    }
  }); // end did-finish-load

  player.webContents.on('did-finish-load', () => {
    logger.info('Player window finished loading');
    win.focus();
  });

  player.on('close', (e) => {
    if (win) {
      logger.info('Attempted to close Player window while Headset running');
      e.preventDefault();
    } else {
      logger.info('Closing Player window and killing Headset');
      app.exit();
    }
  });

  win.on('close', () => {
    logger.info('Closing Headset');
    win = null;
    // after app closes in Win, the global shortcuts are still up, disabling it here.
    globalShortcut.unregisterAll();
    if (player === undefined) return;
    player.close();
  });

  win.on('restore', (e) => {
    e.preventDefault();
    win.show();
  });
}; // end start

app.on('activate', () => { win.show(); });
app.on('ready', start);

app.on('browser-window-created', (e, window) => {
  window.setMenu(null);
});
/*
 * This is the proxy between the 2 windows.
 * It receives messages from a renderer and send them to the other renderer
*/
ipcMain.on('win2Player', (e, args) => {
  logger.win2Player(args);

  player.webContents.send('win2Player', args);
});

ipcMain.on('player2Win', (e, args) => {
  logger.player2Win(args);

  try {
    win.webContents.send('player2Win', args);
  } catch (err) { /* window already closed */ }
});

ipcMain.on('change-locale', (e, lng) => {
  logger.info(`Changing locale to: ${lng}`);

  i18next.changeLanguage(lng);
  headsetTray(tray, win, player, i18next);
});
