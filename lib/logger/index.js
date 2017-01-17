/* eslint-disable no-console */
/* global console */
import _ from 'underscore';
import chalk from 'chalk';

const outputWithColor = function(originalArguments, color) {
  const args = _.flatten(originalArguments);
  const value = chalk.bold[color](args[0]) + '\n' + _.map(_.rest(args), (value) => chalk[color](value)).join('\n');
  console.log(value.trim());
};

const orderedLoglevels = [
  'debug',
  'info',
  'success',
  'warn',
  'error',
  'silent',
];

const loglevel = _.invert(orderedLoglevels);

export default function(currentLoglevel = {}) {
  const  loglevelSeverity = loglevel[currentLoglevel] || loglevel.info;
  const isLogHidden = (currentLevel) => loglevelSeverity > currentLevel;

  return {
    debug() {
      if (isLogHidden(loglevel.debug)) return;
      const args = _.flatten(arguments);
      console.log('[DEBUG]', args.join('\n').trim());
    },

    newline() {
      if (isLogHidden(loglevel.info)) return;
      console.log('');
    },

    info() {
      if (isLogHidden(loglevel.info)) return;
      const args = _.flatten(arguments);
      console.log(args.join('\n').trim());
    },

    success() {
      if (isLogHidden(loglevel.success)) return;
      outputWithColor.call(this, arguments, 'green');
    },

    warn() {
      if (isLogHidden(loglevel.warn)) return;
      outputWithColor.call(this, arguments, 'yellow');
    },

    error() {
      if (isLogHidden(loglevel.error)) return;
      outputWithColor.call(this, arguments, 'red');
    }
  }
}
