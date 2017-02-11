import childProcess from 'child_process';
import fs from 'fs';
import path from 'path';
import _ from 'underscore';

const webpack = './node_modules/webpack/bin/webpack.js';
const replacementMapping = {
  'node ': 'node --no-warnings ',
  '<insert local ip>': '127.0.0.1'
};

const applyReplacements = function(exampleCompilerCommand) {
  return _.reduce(replacementMapping, function(command, replacement, replaceable) {
    return command.replace(replaceable, replacement);
  }, exampleCompilerCommand)
};

const containsSuccessMessage = function(stdout) {
  return stdout.indexOf('webpack: bundle is now VALID') > -1 ||
         stdout.indexOf('webpack: Compiled successfully') > -1;
};

const getExampleCompilerCommand = function(exampleDirectory) {
  const commandMatchPattern = /```([\s\S]+?)```/;

  const readme = fs.readFileSync(`${exampleDirectory}/README.md`); // eslint-disable-line no-sync
  const command = commandMatchPattern.exec(readme);
  if (!_.isArray(command)) return command;
  const exampleCompilerCommand = command[1]
    .split('\n')
    .slice(1, -1)
    .join('\n');
  return applyReplacements(exampleCompilerCommand);
};

export default function(configPath, completeExample) {
  const callback = _.once(function(...args) {
    _.delay(completeExample, 100, ...args);
  });
  const exampleDirectory = path.dirname(configPath);
  const defaultCompilerCommand = `${webpack} --config ./webpack.config.js`;
  const exampleCompilerCommand = getExampleCompilerCommand(exampleDirectory);
  const compilerCommand = _.isString(exampleCompilerCommand) ? exampleCompilerCommand : defaultCompilerCommand;

  const [command, ...commandArgs] = compilerCommand.split(' ');
  const exampleRun = childProcess.spawn(command, commandArgs, { cwd: exampleDirectory });
  let exampleRunTimeout = null;

  const killExample = function() {
    clearTimeout(exampleRunTimeout);
    exampleRun.kill();
  };

  exampleRunTimeout = setTimeout(function() {
    killExample();
  }, 5000);

  exampleRun.stdout.on('data', (data) => {
    const stdout = data.toString();
    if (stdout.toLowerCase().indexOf('error') > -1) {
      killExample();
      callback(['Errors detected in compilation', stdout]);
      return;
    }

    if (containsSuccessMessage(stdout)) {
      killExample();
      callback();
    }
  });

  exampleRun.stderr.on('data', (data) => {
    const stderr = data.toString();
    killExample();
    callback(['Errors output during compilation', stderr]);
  });

  exampleRun.on('close', () => {
    callback(['Unable to detect successful compilation']);
  });

  exampleRun.on('error', (err) => {
    callback(['Failed to run example', err]);
  });
}
