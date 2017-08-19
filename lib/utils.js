import childProcess from 'child_process';
import { reduce } from 'lodash';

export default function parseExampleDirArgv(exampleDir) {
  return typeof exampleDir === 'string' ? [exampleDir] : exampleDir;
}

export function runCommand(command, cwd) {
  return new Promise((resolve, reject) => childProcess.exec(command, { cwd }, (err, stdout, stderr) => {
    if (err) {
      const error = new Error();
      error.err = ['Error calling install command', err];
      return reject(error);
    }

    if (stderr) {
      const outputted = stderr.trim().split('\n');

      // Ignore warnings in stderr (yarn)
      const errors = reduce(outputted, (validErrors, errLine) => {
        if (errLine.indexOf('warning') !== 0) {
          validErrors.push(errLine);
        }
        return validErrors;
      }, []);

      if (errors.length > 0) {
        const error = new Error();
        error.err = ['Error output when running command', errors.join('\n')];
        return reject(error);
      }
    }

    resolve(stdout);
  }));
}
