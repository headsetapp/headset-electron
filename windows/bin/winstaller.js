const electronInstaller = require('electron-winstaller');

const resultPromise = electronInstaller.createWindowsInstaller({
  appDirectory: './build/Headset-win32-ia32',
  outputDirectory: './build/installer',
  authors: 'Alignment Digital',
  exe: 'Headset.exe',
  noMsi: true,
  iconUrl: 'https://raw.githubusercontent.com/headsetapp/headset-electron/master/windows/Headset.ico',
  loadingGif: './source.gif',
});

resultPromise.then(() => console.log('It worked!'), e => console.log(`No dice: ${e.message}`));
