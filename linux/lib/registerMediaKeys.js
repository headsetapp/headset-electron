const DBus = require('dbus-native');
const debug = require('debug');
const { ipcMain } = require('electron');

const logger = debug('headset:mediaKeys');

let track = null;

ipcMain.on('win2Player', (e, args) => {
  if (args[0] === 'trackInfo') {
    track = args[1];
  }
});

function executeMediaKey(win, key) {
  logger('Executing %o media key command', key);
  win.webContents.executeJavaScript(`
    window.electronConnector.emit('${key}')
  `);
}

function registerBindings(win, desktopEnv, bus) {
  let serviceName = `org.${desktopEnv}.SettingsDaemon`;
  let objectPath = `/org/${desktopEnv}/SettingsDaemon/MediaKeys`;
  let interfaceName = `org.${desktopEnv}.SettingsDaemon.MediaKeys`;

  if (desktopEnv === 'gnome3') {
    serviceName = 'org.gnome.SettingsDaemon.MediaKeys';
    objectPath = '/org/gnome/SettingsDaemon/MediaKeys';
    interfaceName = 'org.gnome.SettingsDaemon.MediaKeys';
  }

  bus.getService(serviceName).getInterface(objectPath, interfaceName, (err, iface) => {
    // Error when gnome|gnome3|mate is not found
    if (err) return;

    iface.on('MediaPlayerKeyPressed', (n, keyName) => {
      logger('Media key pressed: %o', keyName);
      switch (keyName) {
        case 'Next':
          executeMediaKey(win, 'play-next');
          break;
        case 'Previous':
          executeMediaKey(win, 'play-previous');
          break;
        case 'Play':
          if (track !== null) {
            executeMediaKey(win, 'play-pause');
          }
          break;
        default:
      }
    });
    iface.GrabMediaPlayerKeys('headset', 0);
    logger('Grabbed media keys for %o', desktopEnv);
  });
}

module.exports = (win) => {
  logger('Registering media Keys');
  const bus = DBus.sessionBus();

  registerBindings(win, 'gnome', bus);
  registerBindings(win, 'gnome3', bus);
  registerBindings(win, 'mate', bus);
};
