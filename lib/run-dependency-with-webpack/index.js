import childProcess from 'child_process';
import fs from 'fs';
import path from 'path';
import { isArray, isEmpty, isString } from 'lodash';

import { COMMAND_MATCH_PATTERN, PHANTOMJS_OPTIONS, WEBPACK_BIN } from '../consts';
import { applyReplacements, containsSuccessMessage, getOutputUrl } from './utils';

/**
 * Open an URL in PhantomJS
 *
 * @param {String} address - URL to be opened
 * @return {void}
 */
const executeUrl = function(address) {
  childProcess.exec(`phantomjs ./scripts/open-url.js '${address}'`, PHANTOMJS_OPTIONS);
};

/**
 * Get an example commands from the dependency example readme
 *
 * @param {any} exampleDirectory - Dependency example directory
 * @returns {String} An example commant
 */
const getExampleCompilerCommand = function(exampleDirectory) {
  const readme = fs.readFileSync(`${exampleDirectory}/README.md`); // eslint-disable-line no-sync
  const command = COMMAND_MATCH_PATTERN.exec(readme);
  if (!isArray(command)) return command;
  const exampleCompilerCommand = command[1]
    .split('\n')
    .slice(1, -1)[0];
  return applyReplacements(exampleCompilerCommand);
};

/**
 * Run the dependency examples with the selected Webpack version
 *
 * @export
 * @param {Object} configPath - Config object
 * @returns {Promise} Promise indicating the process success
 */
export default function(configPath) {
  const exampleDirectory = path.dirname(configPath);
  const defaultCompilerCommand = `${WEBPACK_BIN} --config ./webpack.config.js`;
  const exampleCompilerCommand = getExampleCompilerCommand(exampleDirectory);
  const compilerCommand = isString(exampleCompilerCommand) ? exampleCompilerCommand : defaultCompilerCommand;

  const [command, ...commandArgs] = compilerCommand.split(' ');
  const exampleRun = childProcess.spawn(command, commandArgs, { cwd: exampleDirectory });
  let exampleRunTimeout = null;

  /**
   * Kill the running procss
   *
   * @returns {void}
   */
  const killExample = function() {
    clearTimeout(exampleRunTimeout);
    exampleRun.kill();
  };

  exampleRunTimeout = setTimeout(killExample, 10000);

  return new Promise((resolve, reject) => {
    exampleRun.stdout.on('data', (data) => {
      const stdout = data.toString();
      if (stdout.toLowerCase().indexOf('error') > -1) {
        killExample();
        reject(['Errors detected in compilation', stdout]);
        return;
      }

      if (containsSuccessMessage(stdout)) {
        killExample();
        resolve();
        return;
      }

      const outputUrl = getOutputUrl(stdout);
      if (isString(outputUrl) && !isEmpty(outputUrl)) {
        executeUrl(outputUrl);
      }
    });

    exampleRun.stderr.on('data', (data) => {
      const stderr = data.toString();
      killExample();
      reject(['Errors output during compilation', stderr]);
    });

    exampleRun.on('close', () => {
      reject(['Unable to detect successful compilation']);
    });

    exampleRun.on('error', (err) => {
      reject(['Failed to run example', err]);
    });
  });
}
