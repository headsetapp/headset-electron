
const { app, autoUpdater } = require('electron');

const SERVER = 'https://update.electronjs.org';

class AutoUpdater {
  constructor(options = {}) {
    const feed = `${SERVER}/headsetapp/headset-electron/${process.platform}-${process.arch}/${app.getVersion()}`;

    autoUpdater.setFeedURL(feed);


    autoUpdater.on('update-downloaded', (e) => {
      options.onUpdateDownloaded();
    });

    autoUpdater.checkForUpdates();

    setInterval(() => {
      autoUpdater.checkForUpdates();
    }, 10 * 60 * 1000);
  }

  resetAndInstall() {
    autoUpdater.quitAndInstall();
  }
}

module.exports = AutoUpdater;
