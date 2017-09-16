import fs from 'fs';
import path from 'path';
import rmfr from 'rmfr';
import { runCommand } from '../utils';

/**
 * Run tests of the dependency module
 *
 * @export
 * @param {InstallObject} webpackSetup - Webpack install object
 * @param {InstallObject} dependencySetup - Dependency install object
 * @param {Object} options - Canary options
 * @returns {String} Stdout of the test command
 */
export default async function runDependencyTests(webpackSetup, dependencySetup, options) {
  const dependencyWebpackPath = path.join(options.testPath, 'node_modules', 'webpack');

  // Move the dependency to the destination folder (outside of node_modules)
  await rmfr(options.testPath);
  fs.renameSync(dependencySetup.installLocation, options.testPath);

  // Symlink webpack into the dependency node_modules
  await rmfr(dependencyWebpackPath);
  fs.symlinkSync(webpackSetup.installLocation, dependencyWebpackPath, 'junction');

  // Run tests
  return runCommand(options.test, options.testPath, { ignoreStderr: true }, options);
}
