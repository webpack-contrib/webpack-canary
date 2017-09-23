import glob from 'glob-promise';
import { WEBPACK_CONFIG_FILENAME } from '../consts';
import { getDependencyExamples, getExampleDirectoryPath } from './utils';

/**
 * Creates a promise with glob results of the example folder
 *
 * @param {any} examplePath - Path to the example folder
 * @returns {Promise} Glob results of the example folder
 */
function createExampleGlob(examplePath) {
  return glob(`**/${WEBPACK_CONFIG_FILENAME}`, { cwd: examplePath });
}

/**
 * Get a list of dependency examples
 *
 * @export
 * @param {InstallObject} webpackSetup - Webpack install object
 * @param {InstallObject} dependencySetup - Dependency install object
 * @param {Array} exampleDir - Paths to example directories
 * @returns {Array} A list of dependency examples
 */
export default function (webpackSetup, dependencySetup, exampleDir) {
  const exampleDirectoryPath = getExampleDirectoryPath(dependencySetup, exampleDir);
  const exampleGlob = createExampleGlob(exampleDirectoryPath);

  return exampleGlob.then(getDependencyExamples(exampleDirectoryPath));
}
