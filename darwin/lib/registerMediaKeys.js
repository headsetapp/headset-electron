const debug = require('debug');
const { globalShortcut } = require('electron');

const logger = debug('headset:mediaKeys');

module.exports = (win) => {
  globalShortcut.register('MediaPlayPause', () => {
    logger('Executing %o media key command', 'play-pause');
    win.webContents.executeJavaScript(`
          window.electronConnector.emit('play-pause')
        `);
  });

  globalShortcut.register('MediaNextTrack', () => {
    logger('Executing %o media key command', 'play-next');
    win.webContents.executeJavaScript(`
          window.electronConnector.emit('play-next')
        `);
  });

  globalShortcut.register('MediaPreviousTrack', () => {
    logger('Executing %o media key command', 'play-previous');
    win.webContents.executeJavaScript(`
          window.electronConnector.emit('play-previous')
        `);
  });
};
