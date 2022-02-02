const test = require('ava');
const path = require('path');
const { _electron } = require('playwright');
const { rm } = require('fs/promises');

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

test.before(async (t) => {
  await rm(logFile, { force: true }); // remove pre-existing logs
  process.env = { ...process.env, DEBUG: 'headset*' }; // sets the DEBUG variable for logs
  t.context.app = await _electron.launch({ // eslint-disable-line
    executablePath: appPath,
  });
});

test.after.always(async (t) => {
  if (t.context.app) await t.context.app.close();
});

test('application', async (t) => {
  t.is((await t.context.app.windows()).length, 2, 'Wrong number of windows');
  await new Promise((resolve) => { setTimeout(resolve, 3000); }); // Inserts a 3 sec delay to display all logs
});
