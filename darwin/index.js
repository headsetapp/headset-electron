const debug = require('debug');
const electron = require('electron');
const defaultMenu = require('electron-default-menu');
const { version } = require('./package');
const windowStateKeeper = require('electron-window-state');
const AutoUpdater = require('headset-autoupdater');
const Positioner = require('electron-positioner');

const logger = debug('headset');
const logPlayer2Win = debug('headset:player2Win');
const logWin2Player = debug('headset:win2Player');

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

const isDev = (process.env.NODE_ENV === 'development');
logger('Running as developer: %o', isDev);

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
    icon: `file://${__dirname}/Icon.icns`,
  });

  mainWindowState.manage(win);

  if (isDev) {
    win.loadURL('http://127.0.0.1:3000');
  } else {
    win.loadURL('https://danielravina.github.io/headset/app/');
  }

  new AutoUpdater({
    // allows the updater to close the app properly
    onBeforeQuit: () => { willQuitApp = true; },
  });

  win.webContents.on('did-finish-load', () => {
    logger('Main window finished loading');
    if (player) return;

    player = new BrowserWindow({
      width: 285,
      height: 440,
      resizable: true,
      title: 'Headset - Player',
      maximizable: true,
    });

    new Positioner(player).move('bottomRight');

    if (isDev) {
      player.loadURL('http://127.0.0.1:3001');
    } else {
      player.loadURL('http://danielravina.github.io/headset/player');
    }

    player.on('close', (e) => {
      if (!willQuitApp) {
        logger('Attempted to close Player window while Headset running');
        dialog.showErrorBox('Oops! 🤕', 'Sorry, player window cannot be closed. You can only minimize it.');
        e.preventDefault();
      }
    });

    win.webContents.executeJavaScript(`
      window.electronVersion = "v${version}"
    `);

    logger('Registering MediaKeys');
    globalShortcut.register('MediaPlayPause', () => {
      logger('Executing %o media key command', 'play-pause');
      win.webContents.executeJavaScript(`
        window.electronConnector.emit('play-pause')
      `);
    });

    globalShortcut.register('MediaNextTrack', () => {
      logger('Executing %o media key command', 'play-next');
      win.webContents.executeJavaScript(`
        window.electronConnector.emit('play-next')
      `);
    });

    globalShortcut.register('MediaPreviousTrack', () => {
      logger('Executing %o media key command', 'play-previous');
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
    logger('Closing Headset');
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
  logWin2Player('%O', args);

  player.webContents.send('win2Player', args);
});

ipcMain.on('player2Win', (e, args) => {
  logPlayer2Win('%o', args);

  try {
    win.webContents.send('player2Win', args);
  } catch (err) { /* window already closed */ }
});
