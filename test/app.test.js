const test = require('ava'); // eslint-disable-line
const path = require('path');
const { _electron } = require('playwright');
const { rm } = require('fs/promises');
const printLogs = require('./logs');

let execPath = '';
let logFile = '';

if (process.platform === 'darwin') {
  execPath = 'build/Headset-darwin-x64/Headset.app/Contents/MacOS/Headset';
  logFile = path.join(process.env.HOME, 'Library/Logs/Headset', 'main.log');
} else if (process.platform === 'linux') {
  execPath = 'build/Headset-linux-x64/headset';
  logFile = path.join(process.env.XDG_CONFIG_HOME || `${process.env.HOME}/.config`, 'Headset/logs', 'main.log');
} else if (process.platform === 'win32') {
  execPath = 'build/Headset-win32-ia32/headset.exe';
  logFile = path.join(process.env.APPDATA, 'Headset/logs', 'main.log');
}

const appPath = path.join(__dirname, '..', execPath);

test('application', async (t) => {
  if (process.platform === 'win32') { t.timeout(5 * 60 * 1000); } // 5 min timeout for Windows only

  await rm(logFile, { force: true }); // remove pre-existing logs
  process.env = { ...process.env, DEBUG: 'headset*' }; // sets the DEBUG variable for logs

  // Runs the actual test, which can fail but we'll know why by printing the logs
  const testing = await t.try('trying to start', async (tt) => {
    const app = await _electron.launch({ // eslint-disable-line
      executablePath: appPath,
    });
    await new Promise((resolve) => { setTimeout(resolve, 3000); }); // Inserts a 3 sec delay to record all logs
    tt.is((await app.windows()).length, 2, 'Wrong number of windows');
    app.close();
  });

  await printLogs(logFile, t.log);

  testing.commit(); // pass or fail the test
});
