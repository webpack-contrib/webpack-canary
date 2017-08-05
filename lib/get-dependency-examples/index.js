import glob from 'glob-promise';

import { WEBPACK_CONFIG_FILENAME } from '../consts';
import { getDependencyExamples, getExampleDirectoryPaths } from './utils';

/**
 * Creates a promise with glob results of the example folder
 *
 * @param {any} examplePath - Path to the example folder
 * @returns {Promise} Glob results of the example folder
 */
const createExampleGlob = function(examplePath) {
  return glob(`**/${WEBPACK_CONFIG_FILENAME}`, { cwd: examplePath });
}

/**
 * Get a list of dependency examples
 *
 * @export
 * @param {InstallObject} webpackSetup - Webpack install object
 * @param {InstallObject} dependencySetup - Dependency install object
 * @returns {Array} A list of dependency examples
 */
export default function(webpackSetup, dependencySetup) {
  const exampleDirectoryPaths = getExampleDirectoryPaths(dependencySetup);
  const exampleGlobs = exampleDirectoryPaths.map(createExampleGlob);

  return Promise.all(exampleGlobs).then(getDependencyExamples(exampleDirectoryPaths));
}
