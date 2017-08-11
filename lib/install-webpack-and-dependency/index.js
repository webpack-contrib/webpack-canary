import childProcess from 'child_process';
import { ROOT_PATH } from '../consts';

/**
 * Get the commands that should be run
 *
 * @export
 * @param {InstallObject} webpackSetup - Webpack install object
 * @param {InstallObject} dependencySetup - Dependency install object
 * @param {string} packageManager - Package manager that should be used (npm or yarn)
 * @returns {Object} Install and install dependency commands
 */
function getCommands(webpackSetup, dependencySetup, packageManager) {
  if (packageManager === 'yarn') {
    return {
      install: `yarn add ${webpackSetup} ${dependencySetup}`,
      installDeps: 'yarn',
    };
  }

  return {
    install: `npm install ${webpackSetup} ${dependencySetup}`,
    installDeps: 'npm install',
  };
}

/**
 * Installs the Webpack and dependency modules
 *
 * @export
 * @param {InstallObject} webpackSetup - Webpack install object
 * @param {InstallObject} dependencySetup - Dependency install object
 * @param {string} packageManager - Package manager that should be used (npm or yarn)
 * @returns {Promise} A promise indicating the installation success
 */
export default function (webpackSetup, dependencySetup, packageManager) {
  const commands = getCommands(webpackSetup, dependencySetup, packageManager);

  return new Promise((resolve, reject) => {
    // IMPORTANT: ROOT_PATH needs to contain a package.json file
    // If it doesn't exist, npm will search for the closest package.json and install into this folder
    childProcess.exec(commands.install, { cwd: ROOT_PATH }, (err, stdout, stderr) => {
      if (err) {
        const error = new Error();
        error.err = ['Error calling install command', err];
        return reject(error);
      }

      if (stderr) {
        const error = new Error();
        error.err = ['Error output when installing', stderr];
        return reject(error);
      }

      if (stdout.indexOf(webpackSetup.toLocalName()) === -1 ||
          stdout.indexOf(dependencySetup.toLocalName()) === -1) {
        const error = new Error();
        error.err = ['Expected versions not in dependency tree', stdout];
        return reject(error);
      }

      return childProcess.exec(commands.installDeps, { cwd: dependencySetup.installLocation }, (e) => {
        if (e) {
          const error = new Error();
          error.err = ['Error calling install command for dependency build', e];
          return reject(error);
        }

        return resolve();
      });
    });
  });
}
