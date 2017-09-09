const Application = require('spectron').Application;
const assert = require('assert');
const path = require('path');

const appPath = path.join(__dirname, '..', 'build', 'headset-linux-x64', 'headset');

describe('application', function () { // eslint-disable-line func-names
  this.timeout(10000);

  before(() => {
    this.app = new Application({
      path: appPath,
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
  });
});
