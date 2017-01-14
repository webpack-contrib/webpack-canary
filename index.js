var path = require('path');
var _ = require('underscore');
var Promise = require("bluebird");
var glob = require('glob');
var chalk = require('chalk');
var argv = require('yargs').argv;
var logger = require('./lib/logger');
var generateInstallObjectFor = require('./lib/generate-install-object');
var installWebpackAndLoader = require('./lib/install-webpack-and-loader');
var runLoaderWithWebpack = Promise.promisify(require('./lib/run-loader-with-webpack'));

var getLoaderExamples = function(webpackSetup, loaderSetup, callback) {
  var webpackConfigFilename = 'webpack.config.js';
  var examplesDirectoryName = 'examples';
  var loaderExamplesPath = path.join(loaderSetup.toLocalName(), examplesDirectoryName);
  var globOptions = {
    cwd: path.join('node_modules', loaderExamplesPath)
  };
  glob('**/' + webpackConfigFilename, globOptions, function (err, webpackConfigFilePaths) {
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

var loaderExampleFailure = function(err) {
  logger.error(err);
  process.exit(1);
};

var loaderExamplesSuccess = function() {
  logger.success('All examples passed');
  process.exit()
};

var webpackSetup = generateInstallObjectFor.webpack(argv.webpack);
if (_.isNull(webpackSetup)) {
  logger.error('Webpack version is not valid', argv.webpack);
  return;
}

var loaderSetup = generateInstallObjectFor.loader(argv.loader);
if (_.isNull(loaderSetup)) {
  logger.error('Loader details provided are not valid', argv.loader);
  return;
}

logger.log('Installing ' + chalk.bold(webpackSetup) + ' and ' + chalk.bold(loaderSetup) + ' ...');
installWebpackAndLoader(webpackSetup, loaderSetup, function(err) {
  if (err) {
    logger.error(err);
    return;
  }

  logger.log('Retrieving ' + chalk.bold(loaderSetup.name) + ' examples ...');
  getLoaderExamples(webpackSetup, loaderSetup, function(err, loaderExamples) {
    if (err) {
      logger.error(err);
      return;
    }

    if (_.isEmpty(loaderExamples)) {
      logger.error('Unable to get any loader examples');
      return;
    }

    logger.log('Running ' + chalk.bold(loaderSetup) + ' with ' + chalk.bold(webpackSetup) + ' ...');

    Promise.each(loaderExamples, function(loaderExample, index) {
      var exampleName = loaderExample.name || 'example ' + (index + 1);
      logger.log(' - ' + loaderSetup.name + ' ' + chalk.bold(exampleName) + ' ...');
      return runLoaderWithWebpack(loaderExample.config);
    }).then(loaderExamplesSuccess).catch(loaderExampleFailure);
  });
});
