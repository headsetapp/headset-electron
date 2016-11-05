const electron = require('electron');
const defaultMenu = require('electron-default-menu');

const { NODE_ENV } = process.env;

const AutoUpdater = require('./lib/autoUpdater');

const {
  app,
  BrowserWindow,
  globalShortcut,
  Menu
} = electron;

let win;
let willQuitApp = false;

const start = () => {
  if (NODE_ENV != 'development') {
    new AutoUpdater({
      onUpdate: ((version) => console.log("new version", version))
    })
  }

  win = new BrowserWindow({
    width: 375,
    height: 667,
    resizable: false,
    title: 'Headset',
    // alwaysOnTop: true,
    titleBarStyle: 'hidden-inset',
    icon: `file://${__dirname}/Icon.icns`
  });

  win.loadURL('http://danielravina.github.io/headset/app/');

  win.webContents.on('did-finish-load', () => {
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

    if (NODE_ENV === 'development') {
      win.webContents.openDevTools();
    }

    let menu = defaultMenu();

    menu[2]['submenu'] = [ menu[2]['submenu'][0] ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(menu));

  }); // end start

  win.on('close', (e) => {
    if (willQuitApp) {
      // the user tried to quit the app
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
};

app.on('activate', () => win.show());
app.on('before-quit', () => willQuitApp = true);
app.on('ready', start);
