import _  from 'underscore';
import semver from 'semver';
import InstallObject from './install-object';

const isValidInput = function(input) {
  return _.isString(input) && !_.isEmpty(input);
};

export default {
  webpack: function(webpackVersion) {
    if (!isValidInput(webpackVersion)) return null;

    const cleanedVersion = semver.clean(webpackVersion);
    const webpackDependecy = _.isNull(cleanedVersion) ? webpackVersion : `webpack@${webpackVersion}`;

    return new InstallObject(webpackDependecy);
  },

  loader: function(loader) {
    if (!isValidInput(loader)) return null;

    return new InstallObject(loader);
  }
};
