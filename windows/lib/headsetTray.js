const { Menu } = require('electron');
const logger = require('./headset-logger');

const executeTrayCommand = (win, key) => {
  logger.info('Executing %o command from tray', key);
  win.webContents.executeJavaScript(`
    window.electronConnector.emit('${key}')
  `);
};

module.exports = (tray, win, player, i18n) => {
  logger.info('Setting tray');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: i18n.t('Minimize'),
      click: () => {
        logger.info('Minimizing to tray');
        win.isVisible() ? win.hide() : win.show();
        player.isVisible() ? player.hide() : player.show();
      },
    },
    { type: 'separator' },
    { label: i18n.t('Play/Pause'), click: () => { executeTrayCommand(win, 'play-pause'); } },
    { label: i18n.t('Next'), click: () => { executeTrayCommand(win, 'play-next'); } },
    { label: i18n.t('Previous'), click: () => { executeTrayCommand(win, 'play-previous'); } },
    { type: 'separator' },
    { label: i18n.t('Like'), click: () => { executeTrayCommand(win, 'like'); } },
    { type: 'separator' },
    { label: i18n.t('Exit'), role: 'quit' },
  ]);

  tray.setToolTip('Headset');
  tray.setContextMenu(contextMenu);
};
