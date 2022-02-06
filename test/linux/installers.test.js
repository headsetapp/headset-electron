const { access } = require('fs/promises');
const path = require('path');
const util = require('util');
const test = require('ava'); // eslint-disable-line
const exec = util.promisify(require('child_process').exec);
const { version } = require('../../package.json');

const packagePath = path.join(__dirname, '..', '..', 'build', 'installers');
const debPackage = `headset_${version}_amd64.deb`;
const rpmPackage = `headset-${version}-1.x86_64.rpm`;

test('.deb package created', async (t) => {
  t.timeout(5000);
  await t.notThrowsAsync(access(`${packagePath}/${debPackage}`));
});

test('debian lintian', async (t) => {
  const { stdout } = await exec(`lintian ${packagePath}/${debPackage}`);
  t.is(stdout.match(/\n/g).length, 1, `Warning and errors not overriding:\n${stdout}`);
});

test('.rpm package created', async (t) => {
  t.timeout(5000);
  await t.notThrowsAsync(access(`${packagePath}/${rpmPackage}`));
});
