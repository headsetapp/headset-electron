const installer = require('electron-installer-windows');

const options = {
  src: 'build/Headset-win32-ia32',
  dest: 'build/installers/',
  options: {
    productDescription: 'Headset is a desktop app that turns YouTube into a world class music streaming service.' +
      'Create collections, tune-in to a music subreddit or quickly play that song ' +
      'you’ve had stuck in your head all day!',
    iconUrl: 'https://raw.githubusercontent.com/headsetapp/headset-electron/master/windows/Headset.ico',
    licenseUrl: 'https://raw.githubusercontent.com/headsetapp/headset-electron/master/LICENSE',
  },
};

console.log('Creating package (this may take a while)');

installer(options)
  .then(() => console.log(`Successfully created package at ${options.dest}`))
  .catch((err) => {
    console.error(err, err.stack);
    process.exit(1);
  });
