const { Application } = require('spectron');
const assert = require('assert');
const path = require('path');

const appPath = path.join(__dirname, '..', 'build/Headset-darwin-x64/Headset.app/Contents/MacOS', 'headset');

describe('application', function () {
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
