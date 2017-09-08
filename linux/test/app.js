const Application = require('spectron').Application
var assert = require('assert')
const path = require('path');

const appPath = path.join(__dirname, '..', 'build', 'headset-linux-x64', 'headset');

describe('application', function (test) {
  this.timeout(10000)

  beforeEach(function () {
    this.app = new Application({
      path: appPath
    })
    return this.app.start()
  })

  afterEach(function () {
    if (this.app && this.app.isRunning()) {
      return this.app.stop()
    }
  })

  it('start application', function () {
    return this.app.client.getWindowCount().then(function (count) {
      assert.equal(count, 2)
    })
  })
})
