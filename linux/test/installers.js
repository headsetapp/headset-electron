const fs = require('fs')
const packJson = require('../package.json')
const path = require('path')
const exec = require('child_process').exec;

describe('packages', function () {
  this.timeout(10000)

  const packagePath = path.join(__dirname, '..', 'build', 'installers')
  const debPackage = 'headset_'+packJson.version+'_amd64.deb'
  const rpmPackage = 'headset-'+packJson.version+'.x86_64.rpm'

  it('.deb package created', function() {
    fs.statSync(packagePath +'/'+ debPackage)
  })

  it('debian lintian', function (done) {
    exec('lintian ' + packagePath+'/'+debPackage, function (error, stdout, stderr) {
      done(error && new Error(stdout))
    })
  })

  it('.rpm package created', function() {
    fs.statSync(packagePath +'/'+ rpmPackage)
  })

  // TODO: lintian for rpm package. Need lintianOverride for electron-installer-redhat
})
