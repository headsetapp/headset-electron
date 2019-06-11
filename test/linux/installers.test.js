/* eslint-disable func-names */
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { version } = require('../../package.json');

const packagePath = path.join(__dirname, '..', '..', 'build', 'installers');
const debPackage = `headset_${version}_amd64.deb`;
const rpmPackage = `headset-${version}-1.x86_64.rpm`;

describe('packages', function () {
  this.timeout(40000);

  it('.deb package created', (done) => {
    fs.access(`${packagePath}/${debPackage}`, (err) => {
      if (err) { done(err); } else { done(); }
    });
  });

  it('debian lintian', (done) => {
    exec(`lintian ${packagePath}/${debPackage}`, (error, stdout) => {
      if (error) {
        done(new Error(error + stdout));
      } else if (stdout.match(/\n/g).length === 1) {
        done();
      } else if (stdout.match(/\n/g).length >= 1) {
        done(new Error(`Warning and errors not overriding:\n${stdout}`));
      }
    });
  });

  it('.rpm package created', (done) => {
    fs.access(`${packagePath}/${rpmPackage}`, (err) => {
      if (err) { done(err); } else { done(); }
    });
  });
});
