/* eslint-disable no-console */
/* global console */
import _ from 'underscore';
import chalk from 'chalk';

const outputWithColor = function(originalArguments, color) {
  const args = _.flatten(originalArguments);
  const value = chalk.bold[color](args[0]) + '\n' + _.map(_.rest(args), (value) => chalk[color](value)).join('\n');
  console.log(value);
};

const orderedLogLevels = [
  'debug',
  'info',
  'success',
  'warn',
  'error',
  'silent',
];

const logLevel = _.invert(orderedLogLevels);

export default function(currentLogLevel = {}) {
  var logLevelSeverity = logLevel[currentLogLevel] || logLevel.info;

  return {
    debug() {
      if (logLevelSeverity > logLevel.debug) return;
      const args = _.flatten(arguments);
      console.log('[DEBUG]', args.join('\n'));
    },

    info() {
      if (logLevelSeverity > logLevel.info) return;
      const args = _.flatten(arguments);
      console.log(args.join('\n'));
    },

    success() {
      if (logLevelSeverity > logLevel.success) return;
      outputWithColor.call(this, arguments, 'green');
    },

    warn() {
      if (logLevelSeverity > logLevel.warn) return;
      outputWithColor.call(this, arguments, 'yellow');
    },

    error() {
      if (logLevelSeverity > logLevel.error) return;
      outputWithColor.call(this, arguments, 'red');
    }
  }
}
