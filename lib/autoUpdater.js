const request = require('request');
const { version } = require('../package.json');
const { exec } = require('child_process');

const PACKAGE_REMOTE = 'https://raw.githubusercontent.com/danielravina/headset/master/package.json'
const HOUR = 3600000; // milliseconds

class AutoUpdater {
  constructor(options) {
    this.options = options;
    // check on start
    this.start();

    // and check every hour
    setInterval(() => {
      this.start();
    }, HOUR);
  }

  start() {
    this._checkVersion((newPackage) => {
      console.info('new', newPackage.version,'current', version);
      if (newPackage.version !== version) {
        this._doUpdate(newPackage);
      }
    });
  }

  _checkVersion(andThen) {
    request.get(PACKAGE_REMOTE, (error, response, body) => {
      if (error) return;
      andThen(JSON.parse(body));
    });
  }

  _doUpdate(newPackage) {
    const url = newPackage.downloadUrl.darwin;
    exec(`DL_URL=${url} sh ${__dirname}/../bin/update`, (error, stdout, stderr) => {
      if (error) return console.log(stderr);
      this.options.onUpdate(newPackage.version);
    });
  }
}

module.exports = AutoUpdater;
