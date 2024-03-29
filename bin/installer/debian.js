/* eslint-disable import/no-unresolved */
const path = require('path');
const installer = require('electron-installer-debian');

const options = {
  src: 'build/Headset-linux-x64',
  dest: 'build/installers',
  arch: 'amd64',
  icon: {
    scalable: path.join(__dirname, '..', '..', 'src', 'icons', 'headset.svg'),
    symbolic: path.join(__dirname, '..', '..', 'src', 'icons', 'headset-symbolic.svg'),
  },
  genericName: 'Music Player',
  productDescription: `Headset is a desktop app that turns YouTube into a world class music streaming service.
   Create collections, tune-in to a music subreddit or quickly play that song you’ve had stuck in your head all day!`,
  depends: [
    'dbus',
    'libc6',
  ],
  section: 'sound',
  categories: [
    'Audio',
    'AudioVideo',
    'Player',
    'Music',
  ],
  scripts: {
    postinst: 'bin/debian_scripts/postinst',
    postrm: 'bin/debian_scripts/postrm',
  },
  lintianOverrides: [
    'binary-without-manpage',
    'embedded-library',
    'hardening-no-relro',
    'unstripped-binary-or-object',
    'changelog-file-missing-in-native-package',
    'setuid-binary',
  ],
};

async function main() {
  console.log('Creating Debian installer (this may take a while)');
  try {
    process.umask(0o022);
    await installer(options);
    console.log(`Successfully created installer at ${options.dest}\n`);
  } catch (error) {
    console.error(error, error.stack);
    process.exit(1);
  }
}
main();
