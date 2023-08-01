const path = require('path');
const packager = require('electron-packager');
const { rebuild } = require('electron-rebuild');
const setLanguages = require('electron-packager-languages');

const {
  ARCH, OS, APPLE_ID, APPLE_ID_PASSWORD, TEAM_ID, SIGN,
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
    osxSign: false,
    darwinDarkModeSupport: true,
    appBundleId: 'co.headsetapp.app',
    appCategoryType: 'public.app-category.music',
  });
  // Add electron rebuild for arm64 architectures
  options.afterCopy.push((buildPath, electronVersion, platform, arch, callback) => {
    rebuild({ buildPath, electronVersion, arch })
      .then(() => callback())
      .catch((err) => callback(err));
  });

  if (APPLE_ID && APPLE_ID_PASSWORD && TEAM_ID && SIGN === 'yes') {
    Object.assign(options, {
      osxSign: {
        entitlements: path.join(__dirname, 'entitlements.plist'),
        'entitlements-inherit': path.join(__dirname, 'entitlements.plist'),
        'hardened-runtime': true,
      },
      osxNotarize: {
        tool: 'notarytool',
        appleId: APPLE_ID,
        appleIdPassword: APPLE_ID_PASSWORD,
        teamId: TEAM_ID,
      },
    });
  } else {
    console.log('\x1b[33m%s\x1b[0m\n', 'macOS app will not be signed/notarized');
  }
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
