const packager = require('electron-packager');
const setLanguages = require('electron-packager-languages');
const path = require('path');

const { OS, CERT_PASSWORD } = process.env;

const identity = '3rd Party Mac Developer Application: Daniel Ravina (4BJNEK4V69)';

const ignore = [
  /^\/\.chocolatey$/,
  /^\/\.github$/,
  /^\/bin$/,
  /^\/gh-pages$/,
  /^\/player$/,
  /^\/sig$/,
  /^\/test$/,
  /\.eslintignore$/,
  /\.eslintrc\.json$/,
  /\.gitignore$/,
  /\.travis\.yml$/,
  /appveyor\.yml$/,
  /CONTRIBUTING\.md$/,
  /Procfile$/,
  /README\.md$/,
];

const options = {
  dir: '.',
  out: 'build',
  executableName: 'headset',
  arch: 'x64',
  platform: OS,
  asar: true,
  prune: true,
  overwrite: true,
  ignore,
  afterCopy: [setLanguages(['en', 'en-US'])],
};

if (OS === 'win32') {
  Object.assign(options, {
    icon: path.join(__dirname, '..', '..', 'src', 'icons', 'headset.ico'),
    arch: 'ia32',
  });
}

if (OS === 'darwin') {
  Object.assign(options, {
    executableName: 'Headset',
    icon: path.join(__dirname, '..', '..', 'src', 'icons', 'headset.icns'),
    osxSign: CERT_PASSWORD ? {
      identity,
      keychain: 'mac-build.keychain',
    } : false,
    darwinDarkModeSupport: true,
    appBundleId: 'co.headsetapp.app',
    appCategoryType: 'public.app-category.music',
  });
}

async function main() {
  try {
    const appPaths = await packager(options);
    console.log(`Successfully created package at ${appPaths}`);
  } catch (error) {
    console.error('Error creating package');
    console.error(error, error.stack);
    process.exit(1);
  }
}
main();
