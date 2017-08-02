import path from 'path';
import childProcess from 'child_process';

export default function(webpackSetup, dependencySetup, callback) {
  const installCommand = `npm install ${webpackSetup} ${dependencySetup} --loglevel error`;

  return new Promise((resolve, reject) => {

    childProcess.exec(installCommand, function(err, stdout, stderr) {
      if (err) {
        callback(['Error calling install command', err]);
        reject(['Error calling install command', err]);
        return;
      }

      if (stderr) {
        callback(['Error output when installing', stderr]);
        reject(['Error output when installing', stderr]);
        return;
      }

      if (stdout.indexOf(webpackSetup.toLocalName()) === -1 ||
          stdout.indexOf(dependencySetup.toLocalName()) === -1) {
        callback(['Expected versions not in dependency tree', stdout]);
        reject(['Expected versions not in dependency tree', stdout]);
        return;
      }

      const dependencyInstallLocation = path.join('node_modules', dependencySetup.toLocalName());
      childProcess.exec('npm install', { cwd: dependencyInstallLocation }, function(err) {
        if (err) {
          callback(['Error calling install command for dependency build', err]);
          reject(['Error calling install command for dependency build', err]);
          return;
        }

        callback();
        resolve();
      });
    });
  });
}
