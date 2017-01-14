var _  = require('underscore');
var semver = require('semver');
var npmSafeName = require('npm-safe-name');
var InstallObject = require('./install-object');

module.exports = {
  webpack: function(webpackVersion) {
    if (!_.isString(webpackVersion)) return null;

    var cleanWebpackVersion = semver.clean(webpackVersion);
    if (_.isNull(semver.valid(cleanWebpackVersion))) return null;

    return new InstallObject('webpack', cleanWebpackVersion);
  },

  loader: function(loader) {
    if (!_.isString(loader)) return null;

    var loaderPieces = loader.split('@');
    if (_.isNull(npmSafeName(loaderPieces[0]))) return null;

    var versionSet = !_.isUndefined(loaderPieces[1]);
    var cleanLoaderVersion = versionSet ? semver.clean(loaderPieces[1]) : undefined;
    if (versionSet && _.isNull(semver.valid(cleanLoaderVersion))) return null;

    return new InstallObject(loaderPieces[0], cleanLoaderVersion || 'latest');
  }
};
