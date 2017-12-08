const DBus = require('dbus');
const { ipcMain } = require('electron');

let track = null;

ipcMain.on('win2Player', (e, args) => {
  if (args[0] === 'trackInfo') {
    track = args[1];
  }
});

function executeMediaKey(win, key) {
  win.webContents.executeJavaScript(`
    window.electronConnector.emit('${key}')
  `);
}

function registerBindings(win, desktopEnv, bus) {
  const serviceName = `org.${desktopEnv}.SettingsDaemon`;
  const objectPath = `/org/${desktopEnv}/SettingsDaemon/MediaKeys`;
  const interfaceName = `org.${desktopEnv}.SettingsDaemon.MediaKeys`;

  bus.getInterface(serviceName, objectPath, interfaceName, (err, iface) => {
    if (err) {
      // dbus is showing "Error: No introspectable" that doesn't affect the code
      return;
    }
    iface.on('MediaPlayerKeyPressed', (n, keyName) => {
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

    iface.GrabMediaPlayerKeys(0, interfaceName);
  });
}

module.exports = (win) => {
  const dbus = new DBus();
  const bus = dbus.getBus('session');

  registerBindings(win, 'gnome', bus);
  registerBindings(win, 'mate', bus);
};
