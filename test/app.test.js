/* eslint-disable func-names */
const { Application } = require('spectron');
const path = require('path');
const test = require('ava');
const helper = require('./helper');

let execPath = '';

if (process.platform === 'darwin') {
  execPath = 'build/Headset-darwin-x64/Headset.app/Contents/MacOS/Headset';
} else if (process.platform === 'linux') {
  execPath = 'build/Headset-linux-x64/headset';
} else if (process.platform === 'win32') {
  execPath = 'build/Headset-win32-ia32/headset.exe';
}

const appPath = path.join(__dirname, '..', execPath);

test.before(async (t) => {
  t.context.app = new Application({ // eslint-disable-line
    path: appPath,
    env: {
      DEBUG: 'headset*',
    },
  });
  await t.context.app.start();
});

test.after.always(async (t) => {
  if (t.context.app && t.context.app.isRunning()) await t.context.app.stop();
});

test('application', async (t) => {
  const client = t.context.app.client;
  await client.waitUntilWindowLoaded();
  t.is(await client.getWindowCount(), 2, 'Wrong number of windows');
  await new Promise((resolve) => { setTimeout(resolve, 2000); }); // Inserts a 2 sec delay to display all logs
  helper.printLogs(await client.getMainProcessLogs());
});
