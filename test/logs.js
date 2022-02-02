const { readFile } = require('fs/promises');
const { join } = require('path');

let logFile = '';

if (process.platform === 'darwin') {
  logFile = join(process.env.HOME, 'Library/Logs/Headset', 'main.log');
} else if (process.platform === 'linux') {
  logFile = join(process.env.XDG_CONFIG_HOME || `${process.env.HOME}/.config`, 'Headset/logs', 'main.log');
} else if (process.platform === 'win32') {
  logFile = join(process.env.APPDATA, 'Headset/logs', 'main.log');
}

// Prints a color output
function printFormatedLogs(logs) {
  logs.split(/\r\n|\r|\n/)
    .map((line) => line.split(/\t+\s/))
    .forEach((line) => {
    // Color is dependent on number of elements per line
      switch (line.length) {
        case 3: // regular Headset logs
          console.log('\t\x1b[33m%s \x1b[34m%s\x1b[0m', line[0], line[1], line[2]);
          break;
        case 2: // nodejs error-logs that include time
          console.log('\t\x1b[33m%s\x1b[0m', line[0], line[1]);
          break;
        default: // any other is just printed
          console.log(`\t${line.join(' ')}`);
          break;
      }
    });
}

async function main() {
  try {
    const mainLog = await readFile(logFile, 'utf8'); // reads logs
    printFormatedLogs(mainLog); // pretty print logs
  } catch (error) {
    console.log('\tNo log file found');
  }
}

main();
