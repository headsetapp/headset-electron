const installer = require('@malept/electron-installer-flatpak');
const path = require('path');

const options = {
  src: 'build/Headset-linux-x64',
  dest: 'build/installers',
  genericName: 'Music Player',
  branch: 'stable',
  arch: 'x64',
  icon: {
    scalable: path.join(__dirname, '..', '..', 'src', 'icons', 'headset.svg'),
    symbolic: path.join(__dirname, '..', '..', 'src', 'icons', 'headset-symbolic.svg'),
  },
  categories: [
    'Audio',
    'AudioVideo',
    'Player',
    'Music',
  ],
  finishArgs: [
    '--socket=x11',
    '--share=ipc',
    '--device=dri',
    '--socket=pulseaudio',
    '--env=TMPDIR=/var/tmp',
    '--share=network',
    '--talk-name=org.freedesktop.Notifications',
    '--own-name=org.mpris.MediaPlayer2.headset',
  ],
};

async function main() {
  console.log('Creating flatpak (this may take a while)');
  try {
    await installer(options);
    console.log(`Successfully created flatpak at ${options.dest}`);
  } catch (err) {
    console.error(err, err.stack);
    process.exit(1);
  }
}
main();
