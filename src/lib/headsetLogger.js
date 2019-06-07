const logFile = require('electron-log');
const debug = require('debug');
const { unlinkSync } = require('fs');

const logger = debug('headset');
const logMedia = debug('headset:media');
const logTray = debug('headset:tray');
const logWin2Player = debug('headset:win2Player');
const logPlayer2Win = debug('headset:player2Win');

logFile.transports.console.level = false;
logFile.transports.file.fileName = 'headset.log';
logFile.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] {text}';

const DEBUG = process.env.DEBUG;

class HeadsetLogger {
  // This function will be removed when 'electron-log' gets fixed
  static clear() {
    try {
      unlinkSync(logFile.transports.file.findLogPath());
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Could not clear log', error);
      }
    }
  }

  static info(message) {
    logger(message);
    if (DEBUG === 'headset' || DEBUG === 'headset*') {
      logFile.info(`headset\t\t ${message}`);
    }
  }

  static media(message) {
    logMedia(message);
    if (DEBUG === 'headset:media' || DEBUG === 'headset*') {
      logFile.info(`headset:media\t\t ${message}`);
    }
  }

  static tray(message) {
    logTray(message);
    if (DEBUG === 'headset:tray' || DEBUG === 'headset*') {
      logFile.info(`headset:tray\t\t ${message}`);
    }
  }

  static win2Player(message) {
    logWin2Player('%O', message);
    if (DEBUG === 'headset:win2Player' || DEBUG === 'headset*') {
      if (typeof message[1] === 'object' && message[1] !== null) {
        logFile.info(`headset:win2Player\t ${message[0]}\n${JSON.stringify(message[1], null, 1)}`);
      } else {
        logFile.info(`headset:win2Player\t ${message}`);
      }
    }
  }

  static player2Win(message) {
    logPlayer2Win('%o', message);
  }
}

module.exports = HeadsetLogger;
