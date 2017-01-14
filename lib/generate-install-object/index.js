var semver = require('semver');
var npmSafeName = require('npm-safe-name');
var InstallObject = require('./install-object');

module.exports = {
  webpack: function(webpackVersion) {
    if (typeof webpackVersion !== 'string') return null;

    var cleanWebpackVersion = semver.clean(webpackVersion);
    if (semver.valid(cleanWebpackVersion) === null) return null;

    return new InstallObject('webpack', cleanWebpackVersion);
  },

  loader: function(loader) {
    if (typeof loader !== 'string') return null;

    var loaderPieces = loader.split('@');
    if (npmSafeName(loaderPieces[0]) === null) return null;

    var versionSet = (typeof loaderPieces[1] !== 'undefined');
    var cleanLoaderVersion = versionSet ? semver.clean(loaderPieces[1]) : undefined;
    if (versionSet && semver.valid(cleanLoaderVersion) === null) return null;

    return new InstallObject(loaderPieces[0], cleanLoaderVersion || 'latest');
  }
};
