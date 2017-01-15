import _ from 'underscore';
import Promise from "bluebird";
import chalk from 'chalk';
import yargs from 'yargs';
import logger from './logger';
import generateInstallObjectFor from './generate-install-object';
import installWebpackAndLoader from './install-webpack-and-loader';
import getLoaderExamples from './get-loader-examples';
import runLoaderWithWebpack from './run-loader-with-webpack';

export default function() {
  const runLoaderWithWebpackPromise = Promise.promisify(runLoaderWithWebpack);
  const { argv } = yargs;

  const loaderExampleFailure = function(err) {
    logger.error(err);
    process.exit(1);
  };

  const loaderExamplesSuccess = function() {
    logger.success('All examples passed');
    process.exit()
  };

  const webpackSetup = generateInstallObjectFor.webpack(argv.webpack);
  if (_.isNull(webpackSetup) || webpackSetup.name !== 'webpack') {
    logger.error('Webpack version is not valid', argv.webpack);
    return;
  }

  const loaderSetup = generateInstallObjectFor.loader(argv.loader);
  if (_.isNull(loaderSetup)) {
    logger.error('Loader details provided are not valid', argv.loader);
    return;
  }

  logger.info(`Installing ${chalk.bold(webpackSetup)} and ${chalk.bold(loaderSetup)} ...`);
  installWebpackAndLoader(webpackSetup, loaderSetup, function(err) {
    if (err) {
      logger.error(err);
      return;
    }

    logger.info(`Retrieving ${chalk.bold(loaderSetup.name)} examples ...`);
    getLoaderExamples(webpackSetup, loaderSetup, function(err, loaderExamples) {
      if (err) {
        logger.error(err);
        return;
      }

      if (_.isEmpty(loaderExamples)) {
        logger.error('Unable to get any loader examples');
        return;
      }

      logger.info(`Running ${chalk.bold(loaderSetup)} with ${chalk.bold(webpackSetup)} ...`);

      Promise.each(loaderExamples, function(loaderExample, index) {
        const exampleName = loaderExample.name || `example ${index + 1}`;
        logger.info(` - ${loaderSetup.name} ${chalk.bold(exampleName)} ...`);

        return runLoaderWithWebpackPromise(loaderExample.config);
      })
      .then(loaderExamplesSuccess)
      .catch(loaderExampleFailure);
    });
  });
}
