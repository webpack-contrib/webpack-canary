import childProcess from 'child_process';
import fs from 'fs';
import path from 'path';
import { isArray, isEmpty, isString } from 'lodash';

import { COMMAND_MATCH_PATTERN, PHANTOMJS_OPTIONS, WEBPACK_BIN } from '../consts';
import { applyReplacements, containsSuccessMessage, getOutputUrl } from './utils';

const executeUrl = function(address) {
  childProcess.exec(`phantomjs ./scripts/open-url.js '${address}'`, PHANTOMJS_OPTIONS);
};

const getExampleCompilerCommand = function(exampleDirectory) {
  const readme = fs.readFileSync(`${exampleDirectory}/README.md`); // eslint-disable-line no-sync
  const command = COMMAND_MATCH_PATTERN.exec(readme);
  if (!isArray(command)) return command;
  const exampleCompilerCommand = command[1]
    .split('\n')
    .slice(1, -1)[0];
  return applyReplacements(exampleCompilerCommand);
};

export default function(configPath) {
  const exampleDirectory = path.dirname(configPath);
  const defaultCompilerCommand = `${WEBPACK_BIN} --config ./webpack.config.js`;
  const exampleCompilerCommand = getExampleCompilerCommand(exampleDirectory);
  const compilerCommand = isString(exampleCompilerCommand) ? exampleCompilerCommand : defaultCompilerCommand;

  const [command, ...commandArgs] = compilerCommand.split(' ');
  const exampleRun = childProcess.spawn(command, commandArgs, { cwd: exampleDirectory });
  let exampleRunTimeout = null;

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
