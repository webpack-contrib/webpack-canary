import childProcess from 'child_process';

const webpack = './node_modules/webpack/bin/webpack.js';

export default function(configPath, callback) {
  const compilerCommand = `${webpack} --config ${configPath}`;

  childProcess.exec(compilerCommand, function(err, stdout, stderr) {
    if (err) {
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
