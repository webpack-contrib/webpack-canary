import path from 'path';

import { flatten } from 'lodash';

import { MODULES } from '../consts';

/**
 * Get a list of example directory paths for the given dependency
 *
 * @param {InstallObject} dependencySetup - Dependency install object
 * @param {Array} exampleDir - Paths to example directories
 * @returns {Array} A list of dependency example paths
 */
export function getExampleDirectoryPath(dependencySetup, exampleDir) {
  return path.join(MODULES, dependencySetup.toLocalName(), exampleDir);
}

/**
 * Get a list of Webpack config paths for dependency examples
 *
 * @param {Array} exampleDirectoryPath - A dependency example path
 * @param {any} groupedExamplePaths - Glob operation result
 * @returns {Array} List of example paths
 */
function getWebpackConfigPath(exampleDirectoryPath, groupedExamplePaths) {
  return flatten(
    groupedExamplePaths.map((examplePath) => {
      return { examplePath, exampleDirectory: exampleDirectoryPath };
    })
  );
}

/**
 * Get a list of dependency examples
 *
 * @param {any} exampleDirectoryPath - A dependency example path
 * @returns {Function} - Function that will iterate trough glob results
 */
export function getDependencyExamples(exampleDirectoryPath) {
  return (groupedExamplePaths) => {
    const webpackConfigFilePaths = getWebpackConfigPath(
      exampleDirectoryPath,
      groupedExamplePaths
    );

    return webpackConfigFilePaths.map(({ examplePath, exampleDirectory }) => {
      const exampleName = path.dirname(examplePath);

      return {
        name: exampleName === '.' ? null : exampleName,
        config: path.join(exampleDirectory, examplePath),
      };
    });
  };
}
