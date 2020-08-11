const { ipcMain } = require('electron');
const mpris = require('mpris-service');
const logger = require('./headsetLogger');
const mprisCover = require('./mprisCover');

function changeVolumeState(win, volume) {
  win.webContents.executeJavaScript(`
    window.changeVolumeSate(${volume})
  `);
}

module.exports = (win, player, app) => {
  logger.media('Initializing MPRIS');
  const mprisPlayer = mpris({
    name: 'headset',
    identity: 'Headset',
    canRaise: true,
    supportedInterfaces: ['player'],
    supportedUriSchemes: ['https'],
    supportedMimeTypes: ['audio/mpeg'],
    desktopEntry: 'headset',
  });

  mprisPlayer.playbackStatus = 'Stopped';
  mprisPlayer.rate = 1;
  mprisPlayer.canSeek = true;
  mprisPlayer.canControl = true;
  mprisPlayer.minimumRate = 1;
  mprisPlayer.maximumRate = 1;
  mprisPlayer.volume = 0.75;

  mprisPlayer.on('raise', () => {
    logger.media('Window raised');
    win.show();
  });

  mprisPlayer.on('quit', () => {
    logger.media('Quitting Headset');
    app.exit();
  });

  mprisPlayer.on('rate', () => {
    logger.media('Attempting to change rate');
    mprisPlayer.rate = 1;
  });

  mprisPlayer.on('playpause', () => {
    logger.media('Play-Pause received');
    if (mprisPlayer.playbackStatus === 'Playing'
    || mprisPlayer.playbackStatus === 'Paused') {
      win.webContents.send('media', 'play-pause');
    }
  });

  mprisPlayer.on('play', () => {
    logger.media('Play received');
    if (mprisPlayer.playbackStatus === 'Paused') {
      win.webContents.send('media', 'play-pause');
    }
  });

  mprisPlayer.on('pause', () => {
    logger.media('Pause received');
    if (mprisPlayer.playbackStatus === 'Playing') {
      win.webContents.send('media', 'play-pause');
    }
  });

  mprisPlayer.on('next', () => {
    logger.media('Next received');
    if (mprisPlayer.playbackStatus === 'Playing'
    || mprisPlayer.playbackStatus === 'Paused') {
      win.webContents.send('media', 'play-next');
    }
  });

  mprisPlayer.on('previous', () => {
    logger.media('Previous received');
    if (mprisPlayer.playbackStatus === 'Playing'
    || mprisPlayer.playbackStatus === 'Paused') {
      win.webContents.send('media', 'play-previous');
    }
  });

  mprisPlayer.on('volume', (vol) => {
    if (mprisPlayer.playbackStatus !== 'Stopped') {
      let volume = vol;
      if (vol > 1) { volume = 1; }
      if (vol < 0) { volume = 0; }

      logger.media(`Volume received, set to: ${volume}`);
      changeVolumeState(win, volume * 100);
      player.webContents.send('win2Player', ['setVolume', volume * 100]);
      mprisPlayer.volume = volume;
    }
  });

  mprisPlayer.on('seek', (seek) => {
    if (mprisPlayer.playbackStatus !== 'Stopped') {
      logger.media(`Seek ${seek / 1e6} sec`);
      win.webContents.send('player2Win', ['seekTo', (mprisPlayer.getPosition() + seek) / 1e6]); // in seconds
    }
  });

  mprisPlayer.on('position', (arg) => {
    if (mprisPlayer.playbackStatus !== 'Stopped') {
      logger.media(`Go to position ${arg.position / 1e6} sec`);
      win.webContents.send('player2Win', ['seekTo', arg.position / 1e6]); // in seconds
    }
  });

  mprisPlayer.on('shuffle', (shuffle) => {
    if (mprisPlayer.playbackStatus !== 'Stopped') {
      logger.media(`Set shuffling: ${shuffle}`);
      win.webContents.send('player2Win', ['onMprisShuffle', shuffle]);
      mprisPlayer.shuffle = shuffle;
    }
  });

  mprisPlayer.on('loopStatus', (loop) => {
    if (mprisPlayer.playbackStatus !== 'Stopped') {
      logger.media(`Set looping to: ${loop}`);
      mprisPlayer.loopStatus = loop;
      let repeat = null;
      if (loop === 'Track') repeat = 'one';
      if (loop === 'Playlist') repeat = 'all';
      if (loop === 'None') repeat = null;
      win.webContents.send('player2Win', ['onMprisRepeat', repeat]);
    }
  });

  ipcMain.on('win2Player', async (e, args) => {
    switch (args[0]) {
      case 'setVolume':
        mprisPlayer.volume = (args[1] / 100);
        break;
      case 'trackInfo':
        mprisPlayer.metadata = {
          'xesam:artist': [args[1].artist],
          'xesam:title': args[1].title,
          'xesam:url': `https://www.youtube.com/watch?v=${args[1].id}`,
          'mpris:trackid': mprisPlayer.objectPath('track/0'),
          'mpris:artUrl': await mprisCover(args[1].id),
          'mpris:length': args[1].duration * 1e6, // in microseconds
        };
        logger.media(`Track Info:\n${JSON.stringify(mprisPlayer.metadata, null, 2)}`);
        break;
      case 'seekTo':
        mprisPlayer.seeked(args[1] * 1e6); // in microseconds
        break;
      case 'shuffle':
        mprisPlayer.shuffle = args[1];
        break;
      case 'repeat':
        if (args[1] === 'one') mprisPlayer.loopStatus = 'Track';
        if (args[1] === 'all') mprisPlayer.loopStatus = 'Playlist';
        if (args[1] === null) mprisPlayer.loopStatus = 'None';
        break;
      default:
    }
  });

  ipcMain.on('player2Win', (e, args) => {
    switch (args[0]) {
      case 'currentTime':
        mprisPlayer.getPosition = () => args[1] * 1e6; // in microseconds
        break;
      case 'onStateChange':
        if (args[1] === 1) mprisPlayer.playbackStatus = 'Playing';
        if (args[1] === 2) mprisPlayer.playbackStatus = 'Paused';
        logger.media(`Playback status: ${mprisPlayer.playbackStatus}`);
        break;
      default:
    }
  });
};
