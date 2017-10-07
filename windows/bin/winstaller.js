const electronInstaller = require('electron-winstaller');

console.log('\x1b[1m%s\x1b[0m', 'Packaging Windows installer:');
console.log('Creating package (this may take a while)');

const output = 'build/installers';

const resultPromise = electronInstaller.createWindowsInstaller({
  appDirectory: 'build/Headset-win32-ia32',
  outputDirectory: output,
  authors: 'Alignment Digital',
  exe: 'Headset.exe',
  noMsi: true,
  iconUrl: 'https://raw.githubusercontent.com/headsetapp/headset-electron/master/windows/Headset.ico',
  loadingGif: 'loading.gif',
});

resultPromise.then(() => {
  console.log(`Successfully created installer at ${output}`);
}, (e) => {
  process.exitCode = 1;
  console.error('\x1b[31m%s\x1b[0m', `Error creating installer: ${e.message}`);
});
