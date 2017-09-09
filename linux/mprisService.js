const { ipcMain } = require('electron'); // eslint-disable-line import/no-extraneous-dependencies
const { exec } = require('child_process');
const mpris = require('mpris-service');

function executeMediaKey(win, key) {
  win.webContents.executeJavaScript(`
    window.electronConnector.emit('${key}')
  `);
}

module.exports = (win, player) => {
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
    win.show();
  });

  mprisPlayer.on('quit', () => {
    exec('kill -9 $(pgrep headset) &> /dev/null');
  });

  mprisPlayer.on('rate', () => {
    mprisPlayer.rate = 1 + 1e-15;
  });

  mprisPlayer.on('playpause', () => {
    if (mprisPlayer.playbackStatus === 'Playing' ||
        mprisPlayer.playbackStatus === 'Paused') {
      executeMediaKey(win, 'play-pause');
    }
  });

  mprisPlayer.on('play', () => {
    if (mprisPlayer.playbackStatus === 'Paused') {
      executeMediaKey(win, 'play-pause');
    }
  });

  mprisPlayer.on('pause', () => {
    if (mprisPlayer.playbackStatus === 'Playing') {
      executeMediaKey(win, 'play-pause');
    }
  });

  mprisPlayer.on('next', () => {
    if (mprisPlayer.playbackStatus === 'Playing' ||
        mprisPlayer.playbackStatus === 'Paused') {
      executeMediaKey(win, 'play-next');
    }
  });

  mprisPlayer.on('previous', () => {
    if (mprisPlayer.playbackStatus === 'Playing' ||
        mprisPlayer.playbackStatus === 'Paused') {
      executeMediaKey(win, 'play-previous');
    }
  });

  mprisPlayer.on('volume', (volume) => {
    if (volume > 1) { volume = 1; }
    if (volume < 0) { volume = 0; }
    player.webContents.send('win2Player', ['setVolume', volume * 100]);
    mprisPlayer.volume = volume + 1e-15;
  });

  ipcMain.on('win2Player', (e, args) => {
    switch (args[0]) {
      case 'playVideo':
        mprisPlayer.playbackStatus = 'Playing';
        break;
      case 'pauseVideo':
        mprisPlayer.playbackStatus = 'Paused';
        break;
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
    if (args[0] === 'currentTime') {
      // int64 in microseconds. nodejs dbus doesn't support int64 (bug)
      mprisPlayer.position = Math.round(args[1] * 1e6);
    }
  });
};
