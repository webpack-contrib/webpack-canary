import { runCommand } from '../utils';
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
 * @param {Object} options - Runner options
 * @returns {Promise} A promise indicating the installation success
 */
export default async function(
  webpackSetup,
  dependencySetup,
  packageManager,
  options
) {
  const commands = getCommands(webpackSetup, dependencySetup, packageManager);

  // IMPORTANT: ROOT_PATH needs to contain a package.json file
  // If it doesn't exist, npm will search for the closest package.json and install into this folder
  const stdout = await runCommand(commands.install, ROOT_PATH, {}, options);

  if (
    stdout.indexOf(webpackSetup.toLocalName()) === -1 ||
    stdout.indexOf(dependencySetup.toLocalName()) === -1
  ) {
    const error = new Error();
    error.err = ['Expected versions not in dependency tree', stdout];
    throw error;
  }

  return runCommand(
    commands.installDeps,
    dependencySetup.installLocation,
    {},
    options
  );
}
