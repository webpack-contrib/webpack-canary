import _ from 'underscore';
import chalk from 'chalk';

const outputWithColor = function(originalArguments, color) {
  const args = _.flatten(originalArguments);
  const value = chalk.bold[color](args[0]) + '\n' + _.map(_.rest(args), (value) => chalk[color](value)).join('\n');
  console.log(value);
};

export default {
  debug() {
    const args = _.flatten(arguments);
    console.log('[DEBUG]', args.join('\n'));
  },

  info() {
    const args = _.flatten(arguments);
    console.log(args.join('\n'));
  },

  warn() {
    outputWithColor.call(this, arguments, 'yellow');
  },

  error() {
    outputWithColor.call(this, arguments, 'red');
  },

  success() {
    outputWithColor.call(this, arguments, 'green');
  }
}
