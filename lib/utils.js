import childProcess from 'child_process';
import { reduce } from 'lodash';

export default function parseExampleDirArgv(exampleDir) {
  return typeof exampleDir === 'string' ? [exampleDir] : exampleDir;
}

/**
 * Run a command in a child process
 *
 * @export
 * @param {string} command - A command that needs to be run
 * @param {string} cwd - Location where the command should be run
 * @param {object} [{ ignoreStderr }={}] - Execution options
 * @returns {string} Command output (stdout)
 */
export function runCommand(command, cwd, { ignoreStderr } = {}) {
  return new Promise((resolve, reject) => childProcess.exec(command, { cwd }, (err, stdout, stderr) => {
    if (err) {
      const error = new Error();
      error.err = ['Error calling command', err];
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
        return reject(error);
      }
    }

    return resolve(stdout);
  }));
}
