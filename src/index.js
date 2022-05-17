const squirrel = require('electron-squirrel-startup');
const windowStateKeeper = require('electron-window-state');
const path = require('path');
const fs = require('fs');
const {
  app,
  BrowserWindow,
  dialog,
  globalShortcut,
  ipcMain,
  Menu,
  systemPreferences,
  Tray,
} = require('electron');
const { version } = require('../package.json');
const logger = require('./lib/headsetLogger');

logger.init(); // initializes logger first to log any errors to file
const AutoUpdater = require('./lib/autoUpdater');
const headsetTray = require('./lib/headsetTray');
const mprisService = require('./lib/mprisService');
const registerMediaKeys = require('./lib/registerMediaKeys');
const macOSmedia = require('./lib/macOSmedia');

// Register Discord
require('./lib/discord');

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
  windowIcon = path.join(__dirname, 'icons', 'headset.png');
  app.commandLine.appendSwitch('disable-features', 'MediaSessionService');
}

// Load macOS variables
if (OS === 'darwin') {
  systemPreferences.isTrustedAccessibilityClient(true);
  trayIcon = path.join(__dirname, 'icons', 'headsetTemplate.png');
}

if (process.argv.includes('--disable-gpu')) {
  app.disableHardwareAcceleration();
}

const isDev = (process.env.NODE_ENV === 'development');
const isTest = (process.env.NODE_ENV === 'test');
let isUpdating = false;
logger.info(`Running as developer: ${isDev}`);
logger.info(`Running in test mode: ${isTest}`);

// Quit if second instance found and focus window of first instance
if (!isDev && !app.requestSingleInstanceLock()) {
  app.exit();
}

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
    autoHideMenuBar: true,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: isTest,
    },
  });

  player = new BrowserWindow({
    width: 427,
    height: 300,
    minWidth: 427,
    minHeight: 300,
    closable: false,
    useContentSize: true,
    title: 'Headset - Player',
    icon: windowIcon,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: isTest,
    },
  });

  // Menu for main window. It will be hidden but allows for shortcuts to still work
  if (OS === 'win32' || OS === 'linux') {
    const menu = Menu.buildFromTemplate([{
      label: 'File',
      submenu: [{ role: 'toggleDevTools' }],
    }]);
    win.setMenu(menu);
  }

  mainWindowState.manage(win);

  if (isDev) {
    win.loadURL('http://127.0.0.1:3000');
    player.loadURL('http://lvh.me:3001'); // YouTube player needs a domain, doesn't work with IPs
    win.webContents.openDevTools();
  } else {
    win.loadURL('https://danielravina.github.io/headset/app/');
    player.loadURL('http://danielravina.github.io/headset/player-v2');
  }

  win.webContents.on('did-finish-load', () => {
    logger.info('Main window finished loading');
    win.webContents.send('version', `v${version}`);
  });

  player.webContents.on('did-finish-load', () => {
    logger.info('Player window finished loading');
    win.focus();
    player.minimize();
  });

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    logger.info("Main window couldn't load the content:\n"
    + `errorCode: ${errorCode}\n`
    + `errorDescription: ${errorDescription}`);
    dialog.showErrorBox(
      'Cannot load Headset',
      `Please check your internet connection.\nError: ${errorCode} ${errorDescription}`,
    );
    app.exit(10);
  });

  player.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    logger.info("Player window couldn't load the content:\n"
    + `errorCode: ${errorCode}\n`
    + `errorDescription: ${errorDescription}`);
    dialog.showErrorBox(
      'Cannot load Youtube',
      `Please check your internet connection.\nError: ${errorCode} ${errorDescription}`,
    );
    app.exit(10);
  });

  // Linux doesn't implement closable=false for
  player.on('close', (event) => {
    event.preventDefault();
  });

  win.on('close', (e) => {
    if (OS === 'darwin' && !isUpdating) {
    // Hide the window on macOS
      logger.info('Hide main headset window');
      e.preventDefault();
      win.hide();
    } else {
      close(); // close the app for Linux and Windows
    }
  });

  // Creates a Tray
  if (OS === 'win32' || OS === 'darwin') {
    tray = new Tray(trayIcon);
    headsetTray(tray, win, player);
  }

  // Register MPRIS
  if (OS === 'linux') {
    try { mprisService(win, player, app); } catch (err) { console.error(err); }
  }

  // Media integration for macOS
  macOSmedia(win);

  // Register media keys
  registerMediaKeys(win);

  // Check if app is installed with Squirrel
  if ((OS === 'win32' && fs.existsSync(path.resolve(path.dirname(process.execPath), '..', 'update.exe')))
    || OS === 'darwin') {
    try {
      const autoUpdater = new AutoUpdater({
        onUpdateDownloaded: () => win.webContents.send('update-ready'),
      });

      ipcMain.on('restart-to-update', () => {
        isUpdating = true;
        autoUpdater.resetAndInstall();
      });
    } catch (error) {
      if (error.message !== 'Could not get code signature for running application') {
        console.error(error);
        app.exit();
      }
    }
  }
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
