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
  const callback = function(...args) {
    _.delay(completeExample, 500, ...args);
  };
  const exampleDirectory = path.dirname(configPath);
  const defaultCompilerCommand = `${webpack} --config ./webpack.config.js`;
  const exampleCompilerCommand = getExampleCompilerCommand(exampleDirectory);
  const compilerCommand = _.isString(exampleCompilerCommand) ? exampleCompilerCommand : defaultCompilerCommand;

  childProcess.exec(compilerCommand, { cwd: exampleDirectory, timeout: 5000 }, function(err, stdout, stderr) {
    if (err && !containsSuccessMessage(stdout)) {
      callback(['Error running webpack', err, stdout]);
      return;
    }

    if (stderr) {
      callback(['Errors output during compilation', stderr]);
      return;
    }

    if (stdout.toLowerCase().indexOf('error') > -1) {
      callback(['Errors detected in compilation', stdout]);
      return;
    }

    callback();
  });
}
