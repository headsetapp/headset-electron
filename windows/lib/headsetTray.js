const { Menu } = require('electron');
const logger = require('./headset-logger');

const executeTrayCommand = (win, key) => {
  logger.tray(`Executing ${key} command from tray`);
  win.webContents.executeJavaScript(`
    window.electronConnector.emit('${key}')
  `);
};

module.exports = (tray, win, player, i18n) => {
  logger.tray('Setting tray');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: i18n.t('wrapper:Minimize'),
      click: () => {
        logger.tray('Minimizing to tray');
        win.isVisible() ? win.hide() : win.show();
        player.isVisible() ? player.hide() : player.show();
      },
    },
    { type: 'separator' },
    { label: i18n.t('wrapper:Play/Pause'), click: () => { executeTrayCommand(win, 'play-pause'); } },
    { label: i18n.t('wrapper:Next'), click: () => { executeTrayCommand(win, 'play-next'); } },
    { label: i18n.t('wrapper:Previous'), click: () => { executeTrayCommand(win, 'play-previous'); } },
    { type: 'separator' },
    { label: i18n.t('wrapper:Like'), click: () => { executeTrayCommand(win, 'like'); } },
    { type: 'separator' },
    { label: i18n.t('wrapper:Exit'), role: 'quit' },
  ]);

  tray.setToolTip('Headset');
  tray.setContextMenu(contextMenu);
};
