
const { app, autoUpdater } = require('electron');
const fs = require('fs');
const path = require('path');

const SERVER = 'https://update.electronjs.org';

class AutoUpdater {
  constructor(options = {}) {
    const feed = `${SERVER}/headsetapp/headset-electron/${process.platform}/${app.getVersion()}`;

    autoUpdater.setFeedURL(feed);


    autoUpdater.on('update-downloaded', () => {
      options.onUpdateDownloaded();
    });

    // Check if app is installed with Squirrel
    if (process.platform === 'darwin'
      || (process.platform === 'win32'
          && fs.existsSync(path.resolve(path.dirname(process.execPath), '..', 'update.exe')))) {
      autoUpdater.checkForUpdates();

      setInterval(() => {
        autoUpdater.checkForUpdates();
      }, 10 * 60 * 1000);
    }
  }

  /* eslint-disable class-methods-use-this */
  resetAndInstall() {
    autoUpdater.quitAndInstall();
  }
  /* eslint-enable */
}

module.exports = AutoUpdater;
