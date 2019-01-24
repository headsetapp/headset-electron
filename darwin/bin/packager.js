const packager = require('electron-packager');
const path = require('path');
const setLanguages = require('electron-packager-languages');

const options = {
  dir: '.',
  out: 'build',
  executableName: 'Headset',
  icon: path.join(__dirname, '..', 'icons', 'Icon.icns'),
  platform: 'darwin',
  arch: 'x64',
  asar: true,
  prune: true,
  overwrite: true,
  osxSign: true,
  darwinDarkModeSupport: true,
  appBundleId: 'co.headsetapp.app',
  appCategoryType: 'public.app-category.music',
  ignore: [/^Procfile$/, /^\/sig$/, /^\/bin$/],
  afterCopy: [setLanguages([
    'en', 'es', 'de',
  ])],
};

packager(options)
  .then(appPaths => console.log(`Successfully created package at ${appPaths}`))
  .catch((err) => {
    console.error('Error creating package');
    console.error(err, err.stack);
    process.exit(1);
  });
