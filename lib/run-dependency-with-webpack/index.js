import childProcess from 'child_process';
import fs from 'fs';
import path from 'path';
import _ from 'underscore';

const webpack = './node_modules/webpack/bin/webpack.js';

const getExampleCompilerCommand = function(exampleDirectory) {
  const commandMatchPattern = /```([\s\S]+?)```/;

  const readme = fs.readFileSync(`${exampleDirectory}/README.md`); // eslint-disable-line no-sync
  const command = commandMatchPattern.exec(readme);
  if (!_.isArray(command)) return command;
  return command[1]
    .split('\n')
    .slice(1, -1)
    .join('\n');
};

export default function(configPath, callback) {
  const exampleDirectory = path.dirname(configPath);
  const defaultCompilerCommand = `${webpack} --config ./webpack.config.js`;
  const exampleCompilerCommand = getExampleCompilerCommand(exampleDirectory);
  const compilerCommand = _.isString(exampleCompilerCommand) ? exampleCompilerCommand : defaultCompilerCommand;

  childProcess.exec(compilerCommand, { cwd: exampleDirectory, timeout: 5000 }, function(err, stdout, stderr) {
    if (err && stdout.indexOf('webpack: bundle is now VALID') === -1) {
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
