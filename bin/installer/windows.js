const installer = require('electron-installer-windows');
const path = require('path');

const { CERT_PASSWORD, GITHUB_REF } = process.env;

const options = {
  src: 'build/Headset-win32-ia32',
  dest: 'build/installers/',
  productDescription: 'Headset is a desktop app that turns YouTube into a world class music streaming service.'
    + 'Create collections, tune-in to a music subreddit or quickly play that song '
    + 'you’ve had stuck in your head all day!',
  icon: path.join(__dirname, '..', '..', 'src', 'icons', 'headset.ico'),
  noMsi: true,
  tags: ['headset', 'youtube', 'player', 'radio', 'music'],
  iconNuget: path.join(__dirname, '..', '..', 'src', 'icons', 'headset.png'),
};

if (CERT_PASSWORD && GITHUB_REF && GITHUB_REF.startsWith('refs/tags/')) {
  options.certificateFile = 'sig/headset.pfx';
  options.certificatePassword = CERT_PASSWORD;
} else {
  console.log('Warning: The package will not be signed');
}

async function main() {
  console.log('Creating Windows installer (this may take a while)');
  try {
    await installer(options);
    console.log(`Successfully created installer at ${options.dest}\n`);
  } catch (error) {
    console.log(error.stack.replace(new RegExp(CERT_PASSWORD, 'g'), '**secret**'));
    process.exit(1);
  }
}
main();
