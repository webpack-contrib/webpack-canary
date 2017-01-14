var _ = require('underscore');
var chalk = require('chalk');

var colorValueFunction = function(color) {
  return function (value) {
    return chalk[color](value);
  }
}

var outputWithColor = function(originalArguments, color) {
  var args = _.flatten(originalArguments);
  var value = chalk.bold[color](args[0]) + '\n' + _.map(_.rest(args), colorValueFunction(color)).join('\n');
  console.log(value);
};

module.exports = {
  log: function() {
    var args = _.flatten(arguments);
    console.log(args.join('\n'));
  },

  error: function() {
    outputWithColor.call(null, arguments, 'red');
  },

  success: function() {
    outputWithColor.call(null, arguments, 'green');
  }
}
