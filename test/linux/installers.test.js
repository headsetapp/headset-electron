/* eslint-disable func-names */
const fs = require('fs');
const path = require('path');
const util = require('util');
const test = require('ava');
const exec = util.promisify(require('child_process').exec);
const { version } = require('../../package.json');

const packagePath = path.join(__dirname, '..', '..', 'build', 'installers');
const debPackage = `headset_${version}_amd64.deb`;
const rpmPackage = `headset-${version}-1.x86_64.rpm`;

test.cb('.deb package created', (t) => {
  t.timeout(5000);
  fs.access(`${packagePath}/${debPackage}`, t.end);
});

test('debian lintian', async (t) => {
  const { stdout } = await exec(`lintian ${packagePath}/${debPackage}`);
  t.is(stdout.match(/\n/g).length, 1, `Warning and errors not overriding:\n${stdout}`);
});

test.cb('.rpm package created', (t) => {
  t.timeout(5000);
  fs.access(`${packagePath}/${rpmPackage}`, t.end);
});
