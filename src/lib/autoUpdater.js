const GhReleases = require('electron-gh-releases');
const { app } = require('electron');

class AutoUpdater {
  constructor(options = {}) {
    this.options = options;

    this.updater = new GhReleases({
      repo: 'headsetapp/headset-electron',
      currentVersion: `v${app.getVersion()}`,
    });

    this.updater.on('update-downloaded', () => options.onUpdateDownloaded());

    this.checkForUpdates();

    setInterval(() => {
      this.checkForUpdates();
    }, 3600000);
  }

  resetAndInstall() {
    this.updater.install();
  }

  checkForUpdates() {
    this.updater.check((err, status) => {
      if (!err && status) {
        // Download the update
        this.updater.download();
      }
    });
  }
}

module.exports = AutoUpdater;
