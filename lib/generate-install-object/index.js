import createInstallObject from './install-object';

export default {
  webpack(webpackVersion) {
    return createInstallObject(webpackVersion, true);
  },

  dependency(dependencyString) {
    return createInstallObject(dependencyString);
  }
}
