var electronInstaller = require('electron-winstaller');

resultPromise = electronInstaller.createWindowsInstaller({
  appDirectory: './build/Headset-win32-ia32',
  outputDirectory: './build',
  authors: 'Headset Music',
  exe: 'Headset.exe'
});

resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));
