const electron = require('electron');
const defaultMenu = require('electron-default-menu');
const { NODE_ENV } = process.env;
const { version } = require('./package')
const path = require('path')
const iconPath = path.join(__dirname, 'system_tray16x16.png');
const Positioner = require('electron-positioner')

const {
  app,
  BrowserWindow,
  globalShortcut,
  Menu,
  ipcMain,
  dialog,
  Tray
} = electron;

let win;
let player;
let willQuitApp = false;

const isDev = (NODE_ENV !== 'production')

const start = () => {
  win = new BrowserWindow({
    width: 391,
    height: 726,
    resizable: false,
    title: 'Headset',
    maximizable: false,
    titleBarStyle: 'hidden-inset',
    icon: `file://${__dirname}/Icon.icns`,
    frame: true
  });

  if (isDev) {
    win.loadURL('http://127.0.0.1:3000');
  } else {
    win.loadURL('https://danielravina.github.io/headset/app/');
  }

  win.webContents.on('did-finish-load', () => {
    if (player) return;

    player = new BrowserWindow({
      width: 285,
      height: 440,
      resizable: false,
      title: 'Headset - Player',
      maximizable: false,
    });

    positioner = new Positioner(player).move('bottomCenter')

    setTimeout(()=> {
      player.minimize();
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
      // player.webContents.openDevTools();
    }

    let menu = defaultMenu();

    menu[2]['submenu'] = [ menu[2]['submenu'][0] ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
  }); // end did-finish-load

  win.on('close', (e) => {
    win = null
    player.close()
  });

  win.on('restore', (e) => {
    e.preventDefault();
    win.show();
  });
  ipcMain.on('close', () => win.close())
  ipcMain.on('minimize', () => win.minimize())
}; // end start

app.on('activate', () => win.show());
app.on('before-quit', () => willQuitApp = true);
app.on('ready', start);

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
