// Filters and formats logs belonging only to Headset.
// Returns 3xN array, where N is the number of lines relevant to DEBUG=headset*
function formatLogs(logs) {
  return logs
    .map((line) => {
      line = line.split(' ');
      return [line[0], line[1], line.splice(2).join(' ')];
    })
    .filter(line => !Number.isNaN(Date.parse(line[0])));
}

// Prints a color output of a 3xN array of logs
function printFormatedLogs(logs) {
  logs.forEach((log) => {
    console.log('\t\x1b[33m%s \x1b[34m%s\x1b[0m', log[0], log[1], log[2]);
  });
}

function printLogs(logs) {
  printFormatedLogs(formatLogs(logs));
}

exports.printFormatedLogs = printFormatedLogs;
exports.formatLogs = formatLogs;
exports.printLogs = printLogs;
