const installer = require('electron-installer-windows');
const path = require('path');

const { CERT_PASSWORD, APPVEYOR_REPO_TAG } = process.env;

if (typeof CERT_PASSWORD !== 'string' && APPVEYOR_REPO_TAG === 'true') {
  console.log('Error: The certificate password is not a string');
  throw new Error('The certificate password is not a string');
} else {
  console.log('Warning: The package will not be signed');
}

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
  // certificateFile: 'sig/headset.pfx',
  // certificatePassword: CERT_PASSWORD,
};

async function main() {
  console.log('Creating Windows installer (this may take a while)');
  try {
    await installer(options);
    console.log(`Successfully created installer at ${options.dest}\n`);
  } catch (error) {
    console.error(error, error.stack);
    process.exit(1);
  }
}
main();
