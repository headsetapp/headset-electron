const { Menu } = require('electron');
const logger = require('./headset-logger');

const executeTrayCommand = (win, key) => {
  logger.tray(`Executing ${key} command from tray`);
  win.webContents.executeJavaScript(`
    window.electronConnector.emit('${key}')
  `);
};

<<<<<<< HEAD
module.exports = (tray, win, player) => {
  logger.info('Setting tray');
=======
module.exports = (tray, win, player, i18n) => {
  logger.tray('Setting tray');
>>>>>>> master

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Minimize to tray',
      click: () => {
        logger.tray('Minimizing to tray');
        win.isVisible() ? win.hide() : win.show();
        player.isVisible() ? player.hide() : player.show();
      },
    },
    { type: 'separator' },
    { label: 'Play/Pause', click: () => { executeTrayCommand(win, 'play-pause'); } },
    { label: 'Next', click: () => { executeTrayCommand(win, 'play-next'); } },
    { label: 'Previous', click: () => { executeTrayCommand(win, 'play-previous'); } },
    { type: 'separator' },
    { label: 'Like', click: () => { executeTrayCommand(win, 'like'); } },
    { type: 'separator' },
    { label: 'Exit', role: 'quit' },
  ]);

  tray.setToolTip('Headset');
  tray.setContextMenu(contextMenu);
};
