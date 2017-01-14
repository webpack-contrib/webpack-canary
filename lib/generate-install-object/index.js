var _  = require('underscore');
var InstallObject = require('./install-object');

module.exports = {
  webpack: function(webpackVersion) {
    if (!_.isString(webpackVersion)) return null;

    return new InstallObject('webpack@' + webpackVersion);
  },

  loader: function(loader) {
    if (!_.isString(loader)) return null;

    return new InstallObject(loader);
  }
};
