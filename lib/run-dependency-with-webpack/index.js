import childProcess from 'child_process';
import fs from 'fs';
import path from 'path';
import url from 'url';
import _ from 'underscore';

const webpack = './node_modules/webpack/bin/webpack.js';
const replacementMapping = [
  { replaceable: 'node ', replacement: 'node --no-warnings ' },
  { replaceable: '<insert local ip>', replacement: '127.0.0.1' },
  { replaceable: /^webpack-dev-server$/, replacement: 'node ../bin/webpack-dev-server.js' }
];

const applyReplacements = function(exampleCompilerCommand) {
  return _.reduce(replacementMapping, function(command, { replacement, replaceable }) {
    return command.replace(replaceable, replacement);
  }, exampleCompilerCommand)
};

const containsSuccessMessage = function(stdout) {
  return stdout.indexOf('webpack: bundle is now VALID') > -1 ||
         stdout.indexOf('webpack: Compiled successfully') > -1;
};

const getOutputUrl = function(stdout) {
  const urlMatchPattern = /https?:\/\/[-a-zA-Z0-9@:%._+~#=]{2,256}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi;
  const urlMatch = urlMatchPattern.exec(stdout);
  if (!_.isArray(urlMatch)) return null;

  const address = url.parse(urlMatch[0]);
  if (!_.contains(['localhost', '127.0.0.1'], address.hostname)) {
    return null
  }

  return urlMatch[0];
};

const executeUrl = function(address) {
  childProcess.exec(`phantomjs ./scripts/open-url.js '${address}'`, {
    env: {
      QT_QPA_PLATFORM: 'offscreen'
    },
    timeout: 2000
  });
};

const getExampleCompilerCommand = function(exampleDirectory) {
  const commandMatchPattern = /```([\s\S]+?)```/;

  const readme = fs.readFileSync(`${exampleDirectory}/README.md`); // eslint-disable-line no-sync
  const command = commandMatchPattern.exec(readme);
  if (!_.isArray(command)) return command;
  const exampleCompilerCommand = command[1]
    .split('\n')
    .slice(1, -1)[0];
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

  exampleRunTimeout = setTimeout(killExample, 10000);

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
      return;
    }

    const outputUrl = getOutputUrl(stdout);
    if (_.isString(outputUrl) && !_.isEmpty(outputUrl)) {
      executeUrl(outputUrl);
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
