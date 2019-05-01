const { ipcMain } = require('electron');
const debug = require('debug');
const mpris = require('mpris-service');

const logger = debug('headset:mpris');

function executeMediaKey(win, key) {
  win.webContents.executeJavaScript(`
    window.electronConnector.emit('${key}')
  `);
}

function changeVolumeState(win, volume) {
  win.webContents.executeJavaScript(`
    window.changeVolumeSate(${volume})
  `);
}

module.exports = (win, player, app) => {
  const mprisPlayer = mpris({
    name: 'headset',
    identity: 'Headset',
    canRaise: true,
    supportedInterfaces: ['player'],
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
    logger('Window raised');
    win.show();
  });

  mprisPlayer.on('quit', () => {
    logger('Quitting Headset');
    app.exit();
  });

  mprisPlayer.on('rate', () => {
    logger('Attempting to change rate');
    mprisPlayer.rate = 1;
  });

  mprisPlayer.on('playpause', () => {
    logger('Play-Pause received');
    if (mprisPlayer.playbackStatus === 'Playing'
    || mprisPlayer.playbackStatus === 'Paused') {
      executeMediaKey(win, 'play-pause');
    }
  });

  mprisPlayer.on('play', () => {
    logger('Play received');
    if (mprisPlayer.playbackStatus === 'Paused') {
      executeMediaKey(win, 'play-pause');
    }
  });

  mprisPlayer.on('pause', () => {
    logger('Pause received');
    if (mprisPlayer.playbackStatus === 'Playing') {
      executeMediaKey(win, 'play-pause');
    }
  });

  mprisPlayer.on('next', () => {
    logger('Next received');
    if (mprisPlayer.playbackStatus === 'Playing'
    || mprisPlayer.playbackStatus === 'Paused') {
      executeMediaKey(win, 'play-next');
    }
  });

  mprisPlayer.on('previous', () => {
    logger('Previous received');
    if (mprisPlayer.playbackStatus === 'Playing'
    || mprisPlayer.playbackStatus === 'Paused') {
      executeMediaKey(win, 'play-previous');
    }
  });

  mprisPlayer.on('volume', (volume) => {
    if (mprisPlayer.playbackStatus !== 'Stopped') {
      if (volume > 1) { volume = 1; }
      if (volume < 0) { volume = 0; }

      logger('Volume received, set to: %d', volume);
      changeVolumeState(win, volume * 100);
      player.webContents.send('win2Player', ['setVolume', volume * 100]);
      mprisPlayer.volume = volume;
    }
  });

  mprisPlayer.on('seek', (seek) => {
    if (mprisPlayer.playbackStatus !== 'Stopped') {
      logger(`Seek ${seek / 1e6} sec`);
      win.webContents.send('player2Win', ['seekTo', (mprisPlayer.getPosition() + seek) / 1e6]); // in seconds
    }
  });

  mprisPlayer.on('position', (arg) => {
    if (mprisPlayer.playbackStatus !== 'Stopped') {
      logger(`Go to position ${arg.position / 1e6} sec`);
      win.webContents.send('player2Win', ['seekTo', arg.position / 1e6]); // in seconds
    }
  });

  mprisPlayer.on('shuffle', (shuffle) => {
    if (mprisPlayer.playbackStatus !== 'Stopped') {
      logger(`Set shuffling: ${shuffle}`);
      win.webContents.send('player2Win', ['onMprisShuffle', shuffle]);
      mprisPlayer.shuffle = shuffle;
    }
  });

  mprisPlayer.on('loopStatus', (loop) => {
    if (mprisPlayer.playbackStatus !== 'Stopped') {
      logger(`Set looping to: ${loop}`);
      mprisPlayer.loopStatus = loop;
      let repeat = null;
      if (loop === 'Track') repeat = 'one';
      if (loop === 'Playlist') repeat = 'all';
      if (loop === 'None') repeat = null;
      win.webContents.send('player2Win', ['onMprisRepeat', repeat]);
    }
  });

  ipcMain.on('win2Player', (e, args) => {
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
          'mpris:artUrl': args[1].thumbnail,
          'mpris:length': args[1].duration * 1e6, // in microseconds
        };
        logger(['Track Info:', mprisPlayer.metadata]);
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
        logger('Playback status: %o', mprisPlayer.playbackStatus);
        break;
      default:
    }
  });
};
