const packager = require('electron-packager');
const { rebuild } = require('electron-rebuild');
const setLanguages = require('electron-packager-languages');
const path = require('path');

const {
  ARCH, OS, CERT_PASSWORD, APPLE_ID, APPLE_ID_PASSWORD, TEAM_ID,
} = process.env;

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
  arch: ARCH || 'x64',
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
    osxSign: !!CERT_PASSWORD,
    osxNotarize: {
      tool: 'notarytool',
      appleId: APPLE_ID,
      appleIdPassword: APPLE_ID_PASSWORD,
      teamId: TEAM_ID,
    },
    darwinDarkModeSupport: true,
    appBundleId: 'co.headsetapp.app',
    appCategoryType: 'public.app-category.music',
  });
  options.afterCopy.push((buildPath, electronVersion, platform, arch, callback) => {
    rebuild({ buildPath, electronVersion, arch })
      .then(() => callback())
      .catch((err) => callback(err));
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
