import childProcess from 'child_process';
import Gauge from 'gauge';
import { reduce } from 'lodash';
import { DEFAULT_EXEC_TIMEOUT, TEST_PATH } from './consts';

function parseExampleDirArgv(exampleDir) {
  return typeof exampleDir === 'string' ? [exampleDir] : exampleDir;
}

/**
 * Run a command in a child process
 *
 * @export
 * @param {string} command - A command that needs to be run
 * @param {string} cwd - Location where the command should be run
 * @param {object} [{ ignoreStderr }={}] - Execution options
 * @param {object} options - Runner options
 * @returns {string} Command output (stdout)
 */
export function runCommand(command, cwd, { ignoreStderr } = {}, options) {
  return new Promise((resolve, reject) => {
    let resolved = false;
    childProcess.exec(command, { cwd }, (err, stdout, stderr) => {
      if (err) {
        const error = new Error();
        error.err = ['Error calling command', err];
        resolved = true;
        return reject(error);
      }

      if (stderr && !ignoreStderr) {
        const outputted = stderr.trim().split('\n');

        // Ignore warnings in stderr
        const errors = reduce(outputted, (validErrors, errLine) => {
          if (errLine.indexOf('warning') !== 0 && errLine.indexOf('WARN') === -1 && errLine.indexOf('notice') === -1) {
            validErrors.push(errLine);
          }
          return validErrors;
        }, []);

        if (errors.length > 0) {
          const error = new Error();
          error.err = ['Error output when running command', command, errors.join('\n')];
          resolved = true;
          return reject(error);
        }
      }

      resolved = true;
      return resolve(stdout);
    });
    setTimeout(() => {
      if (!resolved) {
        const error = new Error();
        error.err = ['The command has timed out', command];
        resolved = true;
        reject(error);
      }
    }, options.timeout);
  });
}

/**
 * Transform CLI args to options object
 *
 * @export
 * @param {object} argv - CLI args
 * @param {string} [defaultLevel='info']  - Default log level that should be used inf not defined in CLI
 * @returns
 */
export function argvToOptions(argv, defaultLevel = 'info') {
  const loglevel = argv.verbose ? 'debug' : (argv.loglevel || defaultLevel);
  return {
    loglevel,
    packageManager: argv.packageManager,
    exampleDir: argv.exampleDir,
    test: argv.test,
    testPath: argv.testPath || TEST_PATH,
    timeout: parseInt(argv.timeout, 10) || DEFAULT_EXEC_TIMEOUT,
  };
}

let gauge;
let logger;
let progressOptions;

/**
 * Show the progress start in CLI
 *
 * @export
 * @param {any} description - Step description
 * @param {any} _options - Runner options
 * @param {any} _logger - Logger instance
 * @return {undefined}
 */
export function progressStart(description, _options, _logger) {
  progressOptions = _options;
  logger = _logger;
  if (progressOptions.progress && !progressOptions.verbose) {
    gauge = new Gauge();
    progressUpdate(description, 0, 1);
  }
}

/**
 * Update the progress in CLI
 *
 * @export
 * @param {any} description - Step description
 * @param {any} current - Step number
 * @param {any} total - Total number of steps
 * @return {undefined}
 */
export function progressUpdate(description, current, total) {
  if (progressOptions.progress && !progressOptions.verbose) {
    gauge.show(`${description}`, current / total);
  } else {
    logger.info(description);
  }
}

/**
 * Hide the progress bar when done
 *
 * @export
 * @return {undefined}
 */
export function progressStop() {
  if (progressOptions.progress && !progressOptions.verbose) {
    gauge.hide();
  }
}
