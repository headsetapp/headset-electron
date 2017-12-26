const GhReleases = require('electron-gh-releases')
const { dialog, app } = require('electron')

const dialogOpts = {
  type: 'info',
  buttons: ['Restart', 'Later'],
  title: 'Application Update',
  message: 'New Version is Available!',
  detail: 'Restart the application to apply the updates.'
}

class AutoUpdater {
  constructor(options = {}) {
    this.options = options;
    this.updater = new GhReleases({
      repo: 'headsetapp/headset-electron',
      currentVersion: 'v' + app.getVersion()
    })
    
    this.updater.on('update-downloaded',() => this.updateDownloaded());
  
    this.checkForUpdates();
    
    setTimeout(() => {
      this.checkForUpdates();
    }, 3600000)
  }
  
  updateDownloaded() {
    dialog.showMessageBox(dialogOpts, (response) => {
      if (this.options.onBeforeQuit) this.options.onBeforeQuit()
      
      // Restart the app and install the update
      if (response === 0) this.updater.install();
    });
  }

  checkForUpdates() {
    this.updater.check((err, status) => {
      const log = JSON.stringify([err, status])
      
      fs.writeFile("/Users/danielravina/Desktop/log.log", log)
      
      if (!err && status) {
        // Download the update
        this.updater.download()
      }
    })
  }
}

module.exports = AutoUpdater
