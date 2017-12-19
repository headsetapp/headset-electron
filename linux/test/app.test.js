const { Application } = require('spectron');
const assert = require('assert');
const path = require('path');

const appPath = path.join(__dirname, '..', 'build', 'Headset-linux-x64', 'headset');

describe('application', function () {
  this.timeout(10000);

  before(() => {
    this.app = new Application({
      path: appPath,
      env: {
        DEBUG: 'headset*',
      },
    });
    return this.app.start();
  });

  after(() => {
    if (this.app && this.app.isRunning()) {
      return this.app.stop();
    }
    throw new Error('App is not running');
  });

  it('start application', () => {
    if (this.app && this.app.isRunning()) {
      this.app.client.getWindowCount().then((count) => {
        assert.equal(count, 2);
      });
    }
    // Prints all the logs produced by DEBUG
    this.app.client.getMainProcessLogs().then((logs) => {
      logs.forEach((log) => {
        if (log[0] !== '[') {
          log = log.split(' ');
          console.log('\t\x1b[33m%s \x1b[34m%s\x1b[0m', log[0], log[1], log.splice(2).join(' '));
        }
      });
    });
  });
});
