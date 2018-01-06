const { Application } = require('spectron');
const { exec } = require('child-process-promise');
const assert = require('assert');
const path = require('path');

const appPath = path.join(__dirname, '..', 'build/Headset-darwin-x64/Headset.app/Contents/MacOS', 'Headset');
let app = null;

describe('application', function () {
  this.timeout(10000);

  before((done) => {
    app = new Application({
      path: appPath,
      env: {
        DEBUG: 'headset*',
      },
    });
    app.start()
      .then(() => setTimeout(() => {
        assert.equal(app.isRunning(), true, 'App is not running');
        done();
      }, 2000))
      .catch(err => done(err));
  });

  after(() => app.stop());

  // Displays all the DEBUG logs after each test is run
  afterEach(() => app.client
    .getMainProcessLogs().then((logs) => {
      logs.forEach((log) => {
        log = log.split(' ');
        if (!Number.isNaN(Date.parse(log[0]))) {
          console.log('\t\x1b[33m%s \x1b[34m%s\x1b[0m', log[0], log[1], log.splice(2).join(' '));
        }
      });
    }));

  // Tests that both windows were loaded
  it('start application', () => app.client
    .waitUntilWindowLoaded()
    .getWindowCount().then((count) => {
      assert.equal(count, 2, 'Wrong number of windows');
    }));

  // Simulate pressing a media keys
  it('send media keys', () => Promise.all([
    exec('cliclick kp:play-pause'),
    exec('cliclick kp:play-next'),
    exec('cliclick kp:play-previous')]));
});
