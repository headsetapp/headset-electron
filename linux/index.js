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
  Menu,
} = electron;

let win;
let player;

const isDev = (process.env.NODE_ENV === 'development');
logger('Running as developer: %o', isDev);

// Allows to autoplay video, which is disabled in newer versions of Chrome
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

// Quit if second instance found and focus window of first instance
if (!app.requestSingleInstanceLock()) app.exit();

app.on('second-instance', () => {
  logger('Second instance of Headset found');
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

// Removes the application menu on all windows
Menu.setApplicationMenu(null);

function start() {
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
    useContentSize: true,
    icon: 'icon.png',
    webPreferences: { nodeIntegration: true },
  });

  player = new BrowserWindow({
    width: 427,
    height: 300,
    useContentSize: true,
    show: false,
    title: 'Headset - Player',
    icon: 'icon.png',
    webPreferences: { nodeIntegration: true },
  });

  mainWindowState.manage(win);

  if (isDev) {
    win.loadURL('http://127.0.0.1:3000');
    player.loadURL('http://lvh.me:3001');
    win.webContents.openDevTools();
  } else {
    win.loadURL('https://danielravina.github.io/headset/app/');
    player.loadURL('http://danielravina.github.io/headset/player-v2');
  }

  try {
    logger('Initializing MPRIS and registering MediaKeys');
    mprisService(win, player, app);
    registerMediaKeys(win);
  } catch (err) {
    console.error(err);
  }

  win.webContents.on('did-finish-load', () => {
    logger('Main window finished loading');

    win.webContents.executeJavaScript(`
      window.electronVersion = "v${version}"
    `);
  });

  player.webContents.on('did-finish-load', () => {
    logger('Player window finished loading');
    player.show();
    win.focus();
    setTimeout(() => player.minimize(), 2000);
  });

  player.on('close', (event) => {
    event.preventDefault();
  });

  win.on('close', () => {
    logger('Closing Headset');
    app.exit();
  });
} // end start

app.on('ready', start);

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
