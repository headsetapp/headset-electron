const { ipcMain } = require('electron');
const MediaService = require('electron-media-service');
const logger = require('./headsetLogger');

function executeTrayCommand(win, key) {
  logger.media(`Executing ${key} command from macOS media`);
  win.webContents.send('media', key);
}

// Media integration for macOS
const myService = new MediaService();
myService.startService();

module.exports = (win) => {
  const metadata = {
    title: undefined,
    artist: undefined,
    album: '',
    albumArt: undefined,
    state: undefined,
    id: undefined,
    currentTime: undefined,
    duration: undefined,
  };

  myService.on('play', () => executeTrayCommand(win, 'play-pause'));
  myService.on('pause', () => executeTrayCommand(win, 'play-pause'));
  myService.on('playPause', () => executeTrayCommand(win, 'play-pause'));
  myService.on('next', () => executeTrayCommand(win, 'play-next'));
  myService.on('previous', () => executeTrayCommand(win, 'play-previous'));
  myService.on('seek', (seek) => {
    if (metadata.duration > 0) { // live streams have zero duration and shouldn't be seeked
      logger.media(`Seek to ${seek / 1e3} sec`);
      win.webContents.send('player2Win', ['seekTo', seek / 1e3]); // in seconds
    }
  });

  ipcMain.on('win2Player', async (e, args) => {
    switch (args[0]) {
      case 'trackInfo':
        metadata.title = args[1].title;
        metadata.artist = [args[1].artist];
        metadata.albumArt = `https://i.ytimg.com/vi/${args[1].id}/default.jpg`;
        metadata.state = args[1].isPlaying ? 'playing' : 'paused';
        metadata.id = args[1].id;
        metadata.currentTime = args[1].currentTime * 1e3; // in miliseconds
        metadata.duration = args[1].duration * 1e3; // in miliseconds
        myService.setMetaData(metadata);
        logger.media(`Track Info:\n${JSON.stringify(metadata, null, 2)}`);
        break;
      case 'seekTo':
        if (metadata.duration > 0) { // live streams have zero duration and shouldn't be seeked
          metadata.currentTime = args[1] * 1e3; // in miliseconds
          myService.setMetaData(metadata);
        }
        break;
      default:
    }
  });

  ipcMain.on('player2Win', (e, args) => {
    switch (args[0]) {
      case 'currentTime':
        metadata.currentTime = args[1] * 1e3; // in miliseconds
        break;
      case 'onStateChange':
        if (args[1] === 1) metadata.state = 'playing';
        if (args[1] === 2) metadata.state = 'paused';
        if (args[1] === 1 || args[1] === 2) {
          myService.setMetaData(metadata);
          logger.media(`Playback status: ${metadata.state}`);
        }
        break;
      default:
    }
  });
};
