const DBus = require('dbus-next');
const { ipcMain } = require('electron');
const logger = require('../headsetLogger');

let track = null;

ipcMain.on('win2Player', (e, args) => {
  if (args[0] === 'trackInfo') {
    track = args[1];
  }
});

function executeMediaKey(win, key) {
  logger.media(`Executing ${key} media key command`);
  win.webContents.send('media', key);
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
    const dbusPlayer = await bus.getProxyObject(serviceName, objectPath);
    const mediaKeys = dbusPlayer.getInterface(interfaceName);

    mediaKeys.on('MediaPlayerKeyPressed', (iface, keyName) => {
      logger.media(`Media key pressed: ${keyName}`);
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
    logger.media(`Grabbed media keys for ${desktopEnv}`);
  } catch (err) {
    // Error if trying to grab keys in another desktop environment
  }
}

module.exports = (win) => {
  logger.media('Registering media Keys');
  try {
    const bus = DBus.sessionBus();

    registerBindings(win, 'gnome', bus);
    registerBindings(win, 'gnome3', bus);
    registerBindings(win, 'mate', bus);
  } catch (error) {
    console.error(error);
  }
};
