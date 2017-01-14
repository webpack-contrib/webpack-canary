var path = require('path');
var _ = require('underscore');
var chalk = require('chalk');
var argv = require('yargs').argv;
var logger = require('./lib/logger');
var generateInstallObjectFor = require('./lib/generate-install-object');
var installWebpackAndLoader = require('./lib/install-webpack-and-loader');
var runLoaderWithWebpack = require('./lib/run-loader-with-webpack');

var getLoaderExampleConfig = function(webpackSetup, loaderSetup) {
  // TODO: Think about different examples for different webpack versions

  var loaderExampleConfig
  try {
    loaderExampleConfig = require(path.join(loaderSetup.name, 'examples', 'webpack.config.js'));
  } catch(e) {
    // no action
  }

  return loaderExampleConfig;
};

var compileComplete = function(err) {
  if (err) {
    logger.error(err);
    return;
  }

  logger.success('Example compilation was successful');
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

  // TODO: Support multiple examples
  logger.log('Retrieving ' + chalk.bold(loaderSetup.name) + ' example ...');
  var loaderExampleConfig = getLoaderExampleConfig(webpackSetup, loaderSetup);
  if (_.isUndefined(loaderExampleConfig)) {
    logger.error('Unable to get loader example config');
    return;
  }

  logger.log('Running ' + chalk.bold(loaderSetup) + ' with ' + chalk.bold(webpackSetup) + ' ...');
  runLoaderWithWebpack(loaderExampleConfig, compileComplete);
});
