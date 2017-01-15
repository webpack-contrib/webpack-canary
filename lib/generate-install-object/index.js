var _  = require('underscore');
var semver = require('semver');
var InstallObject = require('./install-object');

var isValidInput = function(input) {
  return _.isString(input) && !_.isEmpty(input);
};

module.exports = {
  webpack: function(webpackVersion) {
    if (!isValidInput(webpackVersion)) return null;
    var cleanedVersion = semver.clean(webpackVersion);
    var webpackDependecy = _.isNull(cleanedVersion) ? webpackVersion : ('webpack@' + webpackVersion);

    return new InstallObject(webpackDependecy);
  },

  loader: function(loader) {
    if (!isValidInput(loader)) return null;

    return new InstallObject(loader);
  }
};
