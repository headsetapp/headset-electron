const { globalShortcut } = require('electron');
const logger = require('./headset-logger');

module.exports = (win) => {
  globalShortcut.register('MediaPlayPause', () => {
    logger.media('Executing play-pause media key command');
    win.webContents.executeJavaScript(`
      window.electronConnector.emit('play-pause')
    `);
  });

  globalShortcut.register('MediaNextTrack', () => {
    logger.media('Executing play-next media key command');
    win.webContents.executeJavaScript(`
      window.electronConnector.emit('play-next')
    `);
  });

  globalShortcut.register('MediaPreviousTrack', () => {
    logger.media('Executing play-previous media key command');
    win.webContents.executeJavaScript(`
      window.electronConnector.emit('play-previous')
    `);
  });
};
