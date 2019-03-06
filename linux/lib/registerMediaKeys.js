const DBus = require('dbus-next');
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

async function registerBindings(win, desktopEnv, bus) {
  let serviceName = `org.${desktopEnv}.SettingsDaemon`;
  let objectPath = `/org/${desktopEnv}/SettingsDaemon/MediaKeys`;
  let interfaceName = `org.${desktopEnv}.SettingsDaemon.MediaKeys`;

  if (desktopEnv === 'gnome3') {
    serviceName = 'org.gnome.SettingsDaemon.MediaKeys';
    objectPath = '/org/gnome/SettingsDaemon/MediaKeys';
    interfaceName = 'org.gnome.SettingsDaemon.MediaKeys';
  }

  try {
    const settings = await bus.getProxyObject(serviceName, objectPath);
    const mediaKeys = settings.getInterface(interfaceName);

    mediaKeys.on('MediaPlayerKeyPressed', (iface, n, keyName) => {
      logger('Media key pressed: %o', keyName);
      switch (keyName) {
        case 'Next':
          executeMediaKey(win, 'play-next');
          break;
        case 'Previous':
          executeMediaKey(win, 'play-previous');
          break;
        case 'Play':
          if (track !== null) executeMediaKey(win, 'play-pause');
          break;
        default:
      }
    });

    mediaKeys.GrabMediaPlayerKeys('headset', 0);
    logger('Grabbed media keys for %o', desktopEnv);
  } catch (err) {
    // Error if trying to grab keys in another desktop environment
  }
}

module.exports = (win) => {
  logger('Registering media Keys');
  const bus = DBus.sessionBus();

  registerBindings(win, 'gnome', bus);
  registerBindings(win, 'gnome3', bus);
  registerBindings(win, 'mate', bus);
};
