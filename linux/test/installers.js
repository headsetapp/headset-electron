const fs = require('fs');
const packJson = require('../package.json');
const path = require('path');
const exec = require('child_process').exec;

describe('packages', function () { // eslint-disable-line func-names
  this.timeout(20000);

  const packagePath = path.join(__dirname, '..', 'build', 'installers');
  const debPackage = `headset_${packJson.version}_amd64.deb`;
  const rpmPackage = `headset-${packJson.version}.x86_64.rpm`;

  it('.deb package created', () => {
    fs.statSync(`${packagePath}/${debPackage}`);
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

  it('.rpm package created', () => {
    fs.statSync(`${packagePath}/${rpmPackage}`);
  });

  // TODO: lintian for rpm package. Need lintianOverride for electron-installer-redhat
});
