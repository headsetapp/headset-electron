const packager = require('electron-packager');
const setLanguages = require('electron-packager-languages');

const options = {
  dir: '.',
  out: 'build',
  executableName: 'headset',
  platform: 'linux',
  arch: 'x64',
  asar: true,
  prune: true,
  overwrite: true,
  ignore: [/^Procfile$/, /^\/gh-pages$/, /^\/sig$/, /^\/bin$/],
  afterCopy: [setLanguages([
    'en', 'en-US', 'es', 'de',
  ])],
};

packager(options)
  .then(appPaths => console.log(`Successfully created package at ${appPaths}`))
  .catch((err) => {
    console.error('Error creating package');
    console.error(err, err.stack);
    process.exit(1);
  });
