const electronInstaller = require('electron-winstaller');

console.log('\x1b[1m%s\x1b[0m', 'Packaging Windows installer:');
console.log('Creating package (this may take a while)');

const output = 'build/installers';

const resultPromise = electronInstaller.createWindowsInstaller({
  appDirectory: 'build/Headset-win32-ia32',
  outputDirectory: output,
  authors: 'Alignment Digital',
  exe: 'headset.exe',
  noMsi: true,
  iconUrl: 'https://raw.githubusercontent.com/headsetapp/headset-electron/master/windows/Headset.ico',
  loadingGif: 'source.gif',
});

resultPromise.then(() => console.log(`Successfully created installer at ${output}`))
  .catch(error => console.error('\x1b[31m%s\x1b[0m', `Error creating installer: ${error.message}`));
