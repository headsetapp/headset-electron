const { Menu } = require('electron');
const logger = require('./headset-logger');

const executeTrayCommand = (win, key) => {
  logger.info('Executing %o command from tray', key);
  win.webContents.executeJavaScript(`
    window.electronConnector.emit('${key}')
  `);
};

module.exports = (tray, win, player) => {
  logger.info('Setting tray');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Minimize to tray',
      click: () => {
        logger.info('Minimizing to tray');

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
    { role: 'quit' },
  ]);

  tray.setToolTip('Headset');
  tray.setContextMenu(contextMenu);
};
