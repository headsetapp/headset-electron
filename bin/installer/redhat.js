const installer = require('electron-installer-redhat');
const path = require('path');

const options = {
  src: 'build/Headset-linux-x64',
  dest: 'build/installers',
  arch: 'x86_64',
  icon: path.join(__dirname, '..', '..', 'src', 'icons', 'headset.png'),
  requires: [
    'dbus',
  ],
  categories: [
    'GNOME',
    'GTK',
    'Audio',
    'Player',
    'Music',
  ],
  scripts: {
    post: 'bin/redhat_scripts/post',
    postun: 'bin/redhat_scripts/postun',
  },
};

console.log('Creating Red Hat package (this may take a while)');
installer(options)
  .then(() => console.log(`Successfully created package at ${options.dest}\n`))
  .catch((error) => {
    console.error(error, error.stack);
    process.exit(1);
  });
