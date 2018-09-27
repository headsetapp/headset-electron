let ytPlayer;
/* This class is the connector to the player window.
   It mirrors the youtube API functions and sends / receive messages
   from and to the main process. The main process then proxy the messages
   to the player window and proxy back the here (via callbacks).
*/
class YTPlayer {
  constructor() {
    this.listenToWin();
    this.startProgressChecker();
    this.playerState = null;
  }

  setState(state) {
    this.playerState = state;
    if (this.videoEnded) {
      this.send('onEnd');
      this.sendCurrentTime();
    }
    this.send('onStateChange', this.playerState);
    return false;
  }

  get videoEnded() {
    return this.playerState === YT.PlayerState.ENDED;
  }

  get isPlaying() {
    return this.playerState === YT.PlayerState.PLAYING;
  }

  pauseVideo() {
    ytPlayer.pauseVideo();
    this.waitToBuffer()
      .then(() => ytPlayer.pauseVideo())
      .catch(err => console.error(err));
  }

  playVideo() {
    ytPlayer.playVideo();
  }

  unMute() {
    ytPlayer.unMute();
  }

  seekTo(value) {
    ytPlayer.seekTo(value);
  }

  loadVideoById(id) {
    ytPlayer.loadVideoById({ videoId: id, suggestedQuality: 'tiny' });
  }

  sendCurrentTime() {
    this.send('currentTime', ytPlayer.getCurrentTime());
  }

  setVolume(value) {
    ytPlayer.setVolume(value);
  }

  logout() {
    window.location.replace('');
  }

  waitToBuffer() {
    let timeOut = 100; // 100mil * 100 tries = 10sec
    /* eslint-disable promise/avoid-new */
    return new Promise((resolve, reject) => {
      const bufferWaitInterval = setInterval(() => {
        if (this.playerState !== YT.PlayerState.BUFFERING) {
          clearInterval(bufferWaitInterval);
          resolve();
        }
        if (--timeOut < 0) { // eslint-disable-line no-plusplus
          clearInterval(bufferWaitInterval);
          reject();
        }
      }, 100);
    });
    /* eslint-enable promise/avoid-new */
  }

  startProgressChecker() {
    setInterval(() => {
      if (this.isPlaying) {
        this.sendCurrentTime();
      }
    }, 500);
  }

  listenToWin() {
    window.ipcRenderer.on('win2Player', (e, args) => {
      const [command, data] = args;
      if (command !== 'trackInfo') this[command](data);
    });
  }

  send(command, args) {
    window.ipcRenderer.send('player2Win', [command, args]);
  }
}

// Replace the 'ytplayer' element with an <iframe> and
// YouTube player after the API code downloads.
// Load the IFrame Player API code asynchronously.
const tag = document.createElement('script');
tag.src = 'https://www.youtube.com/player_api';
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

window.onYouTubePlayerAPIReady = () => {
  let yt;

  ytPlayer = new YT.Player('ytplayer', {
    width: '427',
    height: '240',
    playerVars: {
      showinfo: 0,
      controls: 0,
      disablekb: 1,
      modestbranding: 1,
      widget_referrer: 'https://headsetapp.co',
    },
    events: {
      onReady() {
        yt = new YTPlayer();
        yt.send('onReady');
      },
      onStateChange(e) {
        yt.setState(e.data);
      },
      onError() {
        yt.send('onEnd', true);
      },
    },
  });
};
