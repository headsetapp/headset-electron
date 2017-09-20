const electronInstaller = require('electron-winstaller');

const resultPromise = electronInstaller.createWindowsInstaller({
  appDirectory: './build/Headset-win32-ia32',
  outputDirectory: './build/installer',
  authors: 'Alignment Digital',
  exe: 'Headset.exe',
  noMsi: true,
  iconUrl: `file://${__dirname}/Headset.ico`,
  loadingGif: './loading.gif',
});

resultPromise.then(() => console.log('It worked!'), e => console.log(`No dice: ${e.message}`));
