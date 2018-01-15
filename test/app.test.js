const { Application } = require('spectron');
const assert = require('assert');
const path = require('path');
const delay = require('timeout-as-promise');
const helper = require('./helper.js');

let execPath = '';

if (process.platform === 'darwin') {
  execPath = 'darwin/build/Headset-darwin-x64/Headset.app/Contents/MacOS/Headset';
} else if (process.platform === 'linux') {
  execPath = 'linux/build/Headset-linux-x64/headset';
} else if (process.platform === 'win32') {
  execPath = 'windows/build/Headset-win32-ia32/headset.exe';
}

const appPath = path.join(__dirname, '..', execPath);
let app = null;

describe('application', function () {
  this.timeout(10000);

  before(() => {
    app = new Application({
      path: appPath,
      env: {
        DEBUG: 'headset*',
      },
    });
    return app.start();
  });

  after(() => app.stop());

  // Tests that both windows were created
  it('start application', () => app.client
    .waitUntilWindowLoaded().getWindowCount()
    .then(count => assert.equal(count, 2, 'Wrong number of windows'))
    .then(() => delay(2000)) // Inserts a delay so player window can minimize
    .getMainProcessLogs()
    .then(logs => helper.printLogs(logs)));
});
