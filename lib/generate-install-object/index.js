var _  = require('underscore');
var semver = require('semver');
var InstallObject = require('./install-object');

var isValidInput = function(input) {
  return _.isString(input) && !_.isEmpty(input);
};

module.exports = {
  webpack: function(webpackVersion) {
    if (!isValidInput(webpackVersion)) return null;
    if (_.isNull(semver.clean(webpackVersion))) return null;

    return new InstallObject('webpack@' + webpackVersion);
  },

  loader: function(loader) {
    if (!isValidInput(loader)) return null;

    return new InstallObject(loader);
  }
};
