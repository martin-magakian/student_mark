var colors = require('colors');

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'cyan',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});


module.exports = Logger;
function Logger() {
}

Logger.prototype.info = function(log) {
    console.log(log.info);
}

Logger.prototype.error = function(log) {
    console.log(log.error);
}

Logger.prototype.warn = function(log) {
    console.log(log.warn);
}