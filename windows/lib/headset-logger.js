const logFile = require('electron-log');
const debug = require('debug');

const logger = debug('headset');
const logMedia = debug('headset:media');
const logTray = debug('headset:tray');
const logWin2Player = debug('headset:win2Player');
const logPlayer2Win = debug('headset:player2Win');

logFile.transports.console.level = false;

class HeadsetLogger {
  static info(message) {
    logger(message);
    logFile.info(message);
  }

  static media(message) {
    logMedia(message);
    logFile.info(message);
  }

  static tray(message) {
    logTray(message);
    logFile.info(message);
  }

  static win2Player(message) {
    logWin2Player('%O', message);
    logFile.verbose(message);
  }

  static player2Win(message) {
    logPlayer2Win('%o', message);
  }
}

module.exports = HeadsetLogger;
