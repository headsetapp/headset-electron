const debug = require('debug');
const electron = require('electron');
const defaultMenu = require('electron-default-menu');
const windowStateKeeper = require('electron-window-state');
const AutoUpdater = require('headset-autoupdater');
const path = require('path');

const headsetTray = require('./lib/headsetTray');
const i18next = require('./lib/i18nextConfig');
const registerMediaKeys = require('./lib/registerMediaKeys');
const { version } = require('./package');

const logger = debug('headset');
const logPlayer2Win = debug('headset:player2Win');
const logWin2Player = debug('headset:win2Player');

const {
  app,
  BrowserWindow,
  globalShortcut,
  Menu,
  ipcMain,
  shell,
  Tray,
  systemPreferences,
} = electron;

let win;
let player;
let tray;

const isDev = (process.env.NODE_ENV === 'development');
logger('Running as developer: %o', isDev);

// Allows to autoplay video, which is disabled in newer versions of Chrome
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

systemPreferences.isTrustedAccessibilityClient(true);

function start() {
  new AutoUpdater();

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
    useContentSize: true,
    icon: path.join(__dirname, 'icons', 'Icon.icns'),
    webPreferences: { nodeIntegration: true },
  });

  player = new BrowserWindow({
    width: 427,
    height: 300,
    closable: false,
    useContentSize: true,
    show: false,
    title: 'Headset - Player',
    icon: path.join(__dirname, 'icons', 'Icon.icns'),
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

  i18next.on('initialized', (options) => {
    logger(`i18next has been initialized with ${JSON.stringify(options, null, 2)}`);
  });

  tray = new Tray(path.join(__dirname, 'icons', 'HeadsetTemplate.png'));
  i18next.on('loaded', () => {
    logger('i18next resources loaded');
    headsetTray(tray, win, player, i18next);
  });

  // Creates a default Application Menu
  const menu = defaultMenu(app, shell);
  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));

  logger('Registering MediaKeys');
  registerMediaKeys(win);

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

  player.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    const docsWin = new BrowserWindow({ closable: true });
    docsWin.loadURL(url);
    event.newGuest = docsWin;
  });

  win.on('close', (e) => {
    logger('Minimize main Headset window');
    // the user only tried to close the win
    e.preventDefault();
    win.hide();
  });
} // end start

app.on('activate', () => win.show());

app.on('before-quit', () => {
  player.setClosable(true);
  globalShortcut.unregisterAll();
  app.exit();
});

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

ipcMain.on('change-locale', (e, lng) => {
  logger(`Changing locale to: ${lng}`);

  i18next.changeLanguage(lng);
  headsetTray(tray, win, player, i18next);
});
