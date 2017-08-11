import createInstallObject from './install-object';

export default {
  /**
   * Create a Webpack install object
   *
   * @param {String} webpackVersion - Webpack reference (semver/github/url)
   * @returns {RepositoryInstallObject|RegistryInstallObject|null} InstallObject instance
   */
  webpack(webpackVersion) {
    return createInstallObject(webpackVersion, true);
  },

  /**
   * Create a dependency install object
   *
   * @param {String} dependencyString - Dependency reference (semver/github/url)
   * @returns {RepositoryInstallObject|RegistryInstallObject|null} InstallObject instance
   */
  dependency(dependencyString) {
    return createInstallObject(dependencyString);
  },
};
