const { globalShortcut } = require('electron');
const logger = require('../headsetLogger');

module.exports = (win) => {
  globalShortcut.register('MediaPlayPause', () => {
    logger.media('Executing play-pause media key command');
    win.webContents.send('media', 'play-pause');
  });

  globalShortcut.register('MediaNextTrack', () => {
    logger.media('Executing play-next media key command');
    win.webContents.send('media', 'play-next');
  });

  globalShortcut.register('MediaPreviousTrack', () => {
    logger.media('Executing play-previous media key command');
    win.webContents.send('media', 'play-previous');
  });
};
