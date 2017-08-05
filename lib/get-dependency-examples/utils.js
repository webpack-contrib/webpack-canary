import path from 'path';
import { flatten } from 'lodash';

import { EXAMPLE_DIRECTORIES, MODULES } from '../consts';

/**
 * Get a list of example directory paths for the given dependencty
 *
 * @param {InstallObject} dependencySetup - Dependency install object
 * @returns {Array} A list of dependency example paths
 */
export const getExampleDirectoryPaths = function (dependencySetup) {
  return EXAMPLE_DIRECTORIES
    .map((exampleDirectory) => path.join(MODULES, dependencySetup.toLocalName(), exampleDirectory));
}

/**
 * Get a list of Webpack config paths for dependency examples
 *
 * @param {Array} exampleDirectoryPaths - A list of dependency example paths
 * @param {any} groupedExamplePaths - Glob operation result
 * @returns {Array} List of example paths
 */
const getWebpackConfigPaths = function (exampleDirectoryPaths, groupedExamplePaths) {
  return flatten(groupedExamplePaths.map((examplePathGroup, index) => {
    const exampleDirectory = exampleDirectoryPaths[index];
    return examplePathGroup.map((examplePath) => ({ examplePath, exampleDirectory }));
  }));
}

/**
 * Get a list of dependency examples
 *
 * @param {any} exampleDirectoryPaths - A list of dependency example paths
 * @returns {Function} - Function that will iterate trough glob results
 */
export const getDependencyExamples = function (exampleDirectoryPaths) {
  return (groupedExamplePaths) => {
    const webpackConfigFilePaths = getWebpackConfigPaths(exampleDirectoryPaths, groupedExamplePaths);

    return webpackConfigFilePaths.map(({ examplePath, exampleDirectory }) => {
      const exampleName = path.dirname(examplePath);

      return {
        name: (exampleName === '.') ? undefined : exampleName,
        config: path.join(exampleDirectory, examplePath)
      }
    });
  }
}
