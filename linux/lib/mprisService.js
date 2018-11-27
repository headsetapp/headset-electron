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
  mprisPlayer.rate = 1 + 1e-15; // to avoid storing 1 as byte (nodejs dbus bug)
  mprisPlayer.minimumRate = 1 + 1e-15;
  mprisPlayer.maximumRate = 1 + 1e-15;
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
    logger('Changing rate');
    mprisPlayer.rate = 1 + 1e-15;
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
      if (volume >= 1) { volume = 1 - 1e-15; }
      if (volume <= 0) { volume = 1e-15; }

      logger('Volume received, set to: %d', volume);
      changeVolumeState(win, volume * 100);
      player.webContents.send('win2Player', ['setVolume', volume * 100]);
      mprisPlayer.volume = volume;
    }
  });

  ipcMain.on('win2Player', (e, args) => {
    switch (args[0]) {
      case 'setVolume':
        mprisPlayer.volume = (args[1] / 100) + 1e-15;
        break;
      case 'trackInfo':
        mprisPlayer.canSeek = false;
        mprisPlayer.metadata = {
          'xesam:artist': [args[1].artist],
          'xesam:title': args[1].title,
          'xesam:url': `https://www.youtube.com/watch?v=${args[1].id}`,
          'mpris:artUrl': args[1].thumbnail,
          'mpris:length': args[1].duration * 1e6, // in microseconds
        };
        logger(['Track Info:', mprisPlayer.metadata]);
        break;
      case 'seekTo': {
        const delta = Math.round(args[1] * 1e6) - mprisPlayer.position;
        mprisPlayer.seeked(delta);
        break;
      }
      default:
    }
  });

  ipcMain.on('player2Win', (e, args) => {
    switch (args[0]) {
      case 'currentTime':
        // int64 in microseconds. nodejs dbus doesn't support int64 (bug)
        mprisPlayer.position = Math.round(args[1] * 1e6);
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
