const { app, autoUpdater } = require('electron');
const logger = require('./headsetLogger');

const SERVER = 'https://update.electronjs.org';

class AutoUpdater {
  constructor(options = {}) {
    const url = `${SERVER}/headsetapp/headset-electron/${process.platform}/${app.getVersion()}`;

    autoUpdater.setFeedURL({ url });

    autoUpdater.on('update-downloaded', () => {
      logger.update('Update downloaded');
      options.onUpdateDownloaded();
    });

    autoUpdater.on('error', (error) => {
      logger.update(error); // don't show error dialog to users
    });

    // First run on start
    autoUpdater.checkForUpdates();

    setInterval(() => {
      autoUpdater.checkForUpdates();
    }, 60 * 60 * 1000); // check for updates every hour
  }

  /* eslint-disable class-methods-use-this */
  resetAndInstall() {
    logger.update('Installing update');
    autoUpdater.quitAndInstall();
  }
  /* eslint-enable */
}

module.exports = AutoUpdater;
