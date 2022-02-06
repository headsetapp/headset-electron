const { readFile } = require('fs/promises');

// Prints a color output either using ava t.log or console
function printFormattedLogs(logs, logger) {
  logs.split(/\r\n|\r|\n/)
    .map((line) => line.split(/\t+\s/))
    .forEach((line) => {
    // Color is dependent on number of elements per line
      switch (line.length) {
        case 3: // regular Headset logs
          logger(`\x1b[33m${line[0]} \x1b[34m${line[1]}\x1b[0m ${line[2]}`);
          break;
        case 2: // nodejs error-logs that include time
          logger(`\x1b[33m${line[0]}\x1b[0m ${line[1]}`);
          break;
        default: // any other is just printed
          logger(`${line.join(' ')}`);
          break;
      }
    });
}

async function printLogs(logFile, logger) {
  if (!logger) throw new Error('No logger specified');

  try {
    printFormattedLogs(await readFile(logFile, 'utf8'), logger); // pretty print logs
  } catch (error) {
    logger('No log file found');
  }
}

module.exports = printLogs;
