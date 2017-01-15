var _ = require('underscore');
var Promise = require("bluebird");
var chalk = require('chalk');
var argv = require('yargs').argv;
var logger = require('./lib/logger');
var generateInstallObjectFor = require('./lib/generate-install-object');
var installWebpackAndLoader = require('./lib/install-webpack-and-loader');
var getLoaderExamples = require('./lib/get-loader-examples');
var runLoaderWithWebpack = Promise.promisify(require('./lib/run-loader-with-webpack'));

var loaderExampleFailure = function(err) {
  logger.error(err);
  process.exit(1);
};

var loaderExamplesSuccess = function() {
  logger.success('All examples passed');
  process.exit()
};

var webpackSetup = generateInstallObjectFor.webpack(argv.webpack);
if (_.isNull(webpackSetup) || webpackSetup.name !== 'webpack') {
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
