const { platform } = require('os');
const linux = require('./mediaKeys/linux');
const macOSWindows = require('./mediaKeys/macOSWindows');

const OS = platform();

module.exports = () => { // eslint-disable-line consistent-return
  if (OS === 'linux') { return linux; }
  if (OS === 'win32' || OS === 'darwin') { return macOSWindows; }
};
