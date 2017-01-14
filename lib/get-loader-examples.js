var path = require('path');
var _ = require('underscore');
var glob = require('glob');

module.exports = function(webpackSetup, loaderSetup, callback) {
  var webpackConfigFilename = 'webpack.config.js';
  var examplesDirectoryName = 'examples';
  var loaderExamplesPath = path.join(loaderSetup.toLocalName(), examplesDirectoryName);

  var globOptions = {
    cwd: path.join('node_modules', loaderExamplesPath)
  };

  glob('**/' + webpackConfigFilename, globOptions, function (err, webpackConfigFilePaths) {
    if (err) {
      callback(err);
      return;
    }

    var loaderExamples = _.map(webpackConfigFilePaths, function(webpackConfigFilePath) {
      var examplesName = path.dirname(webpackConfigFilePath);

      return {
        name: (examplesName === '.') ? undefined : examplesName,
        config: require(path.join(loaderExamplesPath, webpackConfigFilePath))
      }
    });

    callback(null, loaderExamples);
  });
};
