import path from 'path';
import { flatten } from 'lodash';
import { EXAMPLE_DIRECTORIES, MODULES } from '../consts';

/**
 * Get a list of example directory paths for the given dependency
 *
 * @param {InstallObject} dependencySetup - Dependency install object
 * @param {Array} exampleDirs - Paths to example directories
 * @returns {Array} A list of dependency example paths
 */
export function getExampleDirectoryPaths(dependencySetup, exampleDirs) {
  const exampleDirectories = exampleDirs || EXAMPLE_DIRECTORIES;

  return exampleDirectories
    .map(exampleDirectory => path.join(MODULES, dependencySetup.toLocalName(), exampleDirectory));
}

/**
 * Get a list of Webpack config paths for dependency examples
 *
 * @param {Array} exampleDirectoryPaths - A list of dependency example paths
 * @param {any} groupedExamplePaths - Glob operation result
 * @returns {Array} List of example paths
 */
function getWebpackConfigPaths(exampleDirectoryPaths, groupedExamplePaths) {
  return flatten(groupedExamplePaths.map((examplePathGroup, index) => {
    const exampleDirectory = exampleDirectoryPaths[index];

    return examplePathGroup.map(examplePath => ({ examplePath, exampleDirectory })); // eslint-disable-line arrow-body-style
  }));
}

/**
 * Get a list of dependency examples
 *
 * @param {any} exampleDirectoryPaths - A list of dependency example paths
 * @returns {Function} - Function that will iterate trough glob results
 */
export function getDependencyExamples(exampleDirectoryPaths) {
  return (groupedExamplePaths) => {
    const webpackConfigFilePaths = getWebpackConfigPaths(exampleDirectoryPaths, groupedExamplePaths);

    return webpackConfigFilePaths.map(({ examplePath, exampleDirectory }) => {
      const exampleName = path.dirname(examplePath);

      return {
        name: (exampleName === '.') ? null : exampleName,
        config: path.join(exampleDirectory, examplePath),
      };
    });
  };
}
