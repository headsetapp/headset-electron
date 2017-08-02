const electron = require('electron');
const defaultMenu = require('electron-default-menu');
const { NODE_ENV } = process.env;
const { version } = require('./package')
const path = require('path')
const { exec } = require('child_process')
const windowStateKeeper = require('electron-window-state');
const DBus = require('dbus');

const {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  dialog,
} = electron;

let win;
let player;

const isDev = false;

const start = () => {
  let mainWindowState = windowStateKeeper();

  win = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: 375,
    height: 667,
    resizable: false,
    title: 'Headset',
    maximizable: false,
    titleBarStyle: 'hidden-inset',
    icon: `file://${__dirname}/icon.png`,
    frame: true
  });

  mainWindowState.manage(win);
  if (isDev) {
    win.loadURL('http://192.168.1.68:3000');
  } else {
    win.loadURL('https://danielravina.github.io/headset/app/');
  }

  win.webContents.on('did-finish-load', () => {
    if (player) return;

    player = new BrowserWindow({
      width: 285,
      height: 440,
      resizable: true,
      title: 'Headset - Player',
      maximizable: true,
    });

    setTimeout(()=> {
      try {
        player.minimize();
      } catch(err) {
       // this prevents a js error if user closes the window too quickly.
      }
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
      } else {
        player = null
        exec('kill -9 $(pgrep Headset) &> /dev/null')
      }
    })
    
    // Code based on MarshallOfSound Google-Play-Music-Desktop-Player-UNOFFICIAL-
    // file src/main/features/linux/mediaKeysDBus.js
    // Other desktop environments might have their own dbus which can be added
    try {
      const bus = DBus.getBus('session');

      registerBindings('gnome', bus);
      registerBindings('mate', bus);
      
    } catch (err) {
      
    }

    win.webContents.executeJavaScript(`
      window.electronVersion = "v${version}"
    `)

    if (isDev) {
      win.webContents.openDevTools();
    }
  }); // end did-finish-load

  win.on('close', (e) => {
    win = null
    player.close()
  });

  win.on('restore', (e) => {
    e.preventDefault();
    win.show();
  });
}; // end start

app.on('activate', () => win.show());
app.on('ready', start);

app.on('browser-window-created',function(e,window) {
  window.setMenu(null);
});

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

// Code based on MarshallOfSound Google-Play-Music-Desktop-Player-UNOFFICIAL-
// file src/main/features/linux/mediaKeysDBus.js
function registerBindings(desktopEnv, bus) {
  bus.getInterface(`org.${desktopEnv}.SettingsDaemon`,
  `/org/${desktopEnv}/SettingsDaemon/MediaKeys`,
  `org.${desktopEnv}.SettingsDaemon.MediaKeys`, (err, iface) => {
    if (!err) {
      iface.on('MediaPlayerKeyPressed', (n, keyName) => {
        switch (keyName) {
          case 'Next': win.webContents.executeJavaScript(`
                         window.electronConnector.emit('play-next')
                       `); return;
          case 'Previous': win.webContents.executeJavaScript(`
                             window.electronConnector.emit('play-previous')
                           `); return;
          case 'Play': win.webContents.executeJavaScript(`
                         window.electronConnector.emit('play-pause')
                       `); return;
          default: return;
        }
      });
      iface.GrabMediaPlayerKeys(0, `org.${desktopEnv}.SettingsDaemon.MediaKeys`);
    }
  });
};
