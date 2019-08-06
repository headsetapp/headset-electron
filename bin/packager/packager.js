const packager = require('electron-packager');
const setLanguages = require('electron-packager-languages');
const path = require('path');

const { OS } = process.env;

let arch;
let executableName;
let icon;

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

if (OS === 'linux') {
  executableName = 'headset';
  icon = null;
  arch = 'x64';
}
if (OS === 'win32') {
  executableName = 'headset';
  icon = path.join(__dirname, '..', '..', 'src', 'icons', 'headset.ico');
  arch = 'ia32';
}
if (OS === 'darwin') {
  executableName = 'Headset';
  icon = path.join(__dirname, '..', '..', 'src', 'icons', 'headset.icns');
  arch = 'x64';
}


const options = {
  dir: '.',
  out: 'build',
  executableName,
  icon,
  arch,
  platform: OS,
  asar: true,
  prune: true,
  overwrite: true,
  osxSign: true,
  darwinDarkModeSupport: true,
  appBundleId: 'co.headsetapp.app',
  appCategoryType: 'public.app-category.music',
  ignore,
  afterCopy: [setLanguages(['en', 'en-US'])],
};

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
