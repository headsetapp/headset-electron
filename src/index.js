const defaultMenu = require('electron-default-menu');
const squirrel = require('electron-squirrel-startup');
const windowStateKeeper = require('electron-window-state');
const AutoUpdater = require('headset-autoupdater');
const path = require('path');
const {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  Menu,
  shell,
  systemPreferences,
  Tray,
} = require('electron');

const { version } = require('../package');
const logger = require('./lib/headsetLogger');
const headsetTray = require('./lib/headsetTray');
const mprisService = require('./lib/mprisService');
const registerMediaKeys = require('./lib/registerMediaKeys');

// Delete the log file. Just a workaround until 'electron-log' is updated
logger.clear();

let player;
let tray;
let trayIcon;
let win;
let windowIcon;

const OS = process.platform;

// Load Windows variables
if (OS === 'win32') {
  // Exit the app if it starts from squirrel
  if (squirrel) app.exit();
  Menu.setApplicationMenu(null);
  windowIcon = path.join(__dirname, 'icons', 'headset.ico');
  trayIcon = windowIcon;
}

// Load Linux variables
if (OS === 'linux') {
  Menu.setApplicationMenu(null);
  windowIcon = path.join(__dirname, 'icons', 'windowIcon.ico');
}

// Load macOS variables
if (OS === 'darwin') {
  systemPreferences.isTrustedAccessibilityClient(true);
  const menu = defaultMenu(app, shell);
  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
  trayIcon = path.join(__dirname, 'icons', 'headsetTemplate.png');
}

if (process.argv.includes('--disable-gpu')) {
  app.disableHardwareAcceleration();
}

const isDev = (process.env.NODE_ENV === 'development');
logger.info(`Running as developer: ${isDev}`);

// Allows to autoplay video, which is disabled in newer versions of Chrome
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

// Quit if second instance found and focus window of first instance
if (!app.requestSingleInstanceLock()) app.exit();

app.on('second-instance', () => {
  logger.info('Second instance of Headset found');
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

function close() {
  logger.info('Closing Headset');
  // after app closes in Win, the global shortcuts are still up, disabling it here.
  globalShortcut.unregisterAll();
  app.exit();
}

function start() {
  if (OS === 'win32' || OS === 'darwin') {
    new AutoUpdater(); // Check if new updates
  }

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
    useContentSize: true,
    icon: windowIcon,
    titleBarStyle: 'hiddenInset',
    webPreferences: { nodeIntegration: true },
  });

  player = new BrowserWindow({
    width: 427,
    height: 300,
    closable: false,
    useContentSize: true,
    title: 'Headset - Player',
    icon: windowIcon,
    webPreferences: { nodeIntegration: true },
  });

  mainWindowState.manage(win);

  if (isDev) {
    win.loadURL('http://127.0.0.1:3000');
    player.loadURL('http://lvh.me:3001'); // YouTube player needs a domain, doesn't work with IPs
    win.webContents.openDevTools();
  } else {
    win.loadURL('https://danielravina.github.io/headset/app/');
    player.loadURL('http://danielravina.github.io/headset/player-v2');
  }

  // Creates a Tray
  if (OS === 'win32' || OS === 'darwin') {
    tray = new Tray(trayIcon);
    headsetTray(tray, win, player);
  }

  // Register MPRIS
  if (OS === 'linux') {
    try { mprisService(win, player, app); } catch (err) { console.error(err); }
  }

  // Register media keys
  registerMediaKeys(win);

  win.webContents.on('did-finish-load', () => {
    logger.info('Main window finished loading');

    win.webContents.executeJavaScript(`
      window.electronVersion = "v${version}"
    `);
  });

  player.webContents.on('did-finish-load', () => {
    logger.info('Player window finished loading');
    win.focus();
    setTimeout(() => player.minimize(), 2000);
  });

  player.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    const docsWin = new BrowserWindow({ closable: true });
    docsWin.loadURL(url);
    event.newGuest = docsWin; // eslint-disable-line no-param-reassign
  });

  win.on('close', (e) => {
    if (OS !== 'darwin') { close(); } // close the app for Linux and Windows
    // Hide the window on macOS
    logger.info('Hide main headset window');
    e.preventDefault();
    win.hide();
  });
} // end start

app.on('ready', start);

app.on('activate', () => win.show()); // macOS only

app.on('before-quit', close);

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
