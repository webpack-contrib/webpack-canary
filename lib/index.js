import _ from 'underscore';
import Promise from "bluebird";
import chalk from 'chalk';
import getLogger from './logger';
import generateInstallObjectFor from './generate-install-object';
import installWebpackAndDependency from './install-webpack-and-dependency';
import getDependencyExamples from './get-dependency-examples';
import runDependencyWithWebpack from './run-dependency-with-webpack';

export default function(webpackVersion, dependencyVersion, options, callback) {
  const logger = getLogger(options.loglevel);
  const runDependencyWithWebpackPromise = Promise.promisify(runDependencyWithWebpack);

  const webpackSetup = generateInstallObjectFor.webpack(webpackVersion);
  if (_.isNull(webpackSetup) || webpackSetup.name !== 'webpack') {
    callback(['Webpack version is not valid', webpackVersion]);
    return;
  }

  const dependencySetup = generateInstallObjectFor.dependency(dependencyVersion);
  if (_.isNull(dependencySetup)) {
    callback(['Dependency details provided are not valid', dependencyVersion]);
    return;
  }

  logger.info(`Installing ${chalk.bold(webpackSetup)} and ${chalk.bold(dependencySetup)} ...`);
  installWebpackAndDependency(webpackSetup, dependencySetup, function(err) {
    if (err) {
      callback(err);
      return;
    }

    logger.info(`Retrieving ${chalk.bold(dependencySetup.name)} examples ...`);
    getDependencyExamples(webpackSetup, dependencySetup, function(err, dependencyExamples) {
      if (err) {
        callback(err);
        return;
      }

      if (_.isEmpty(dependencyExamples)) {
        callback('Unable to get any dependency examples');
        return;
      }

      logger.info(`Running ${chalk.bold(dependencySetup)} with ${chalk.bold(webpackSetup)} ...`);

      Promise.each(dependencyExamples, function(dependencyExample, index) {
        dependencyExample.name = dependencyExample.name || `example ${index + 1}`;
        logger.info(` - ${dependencySetup.name} ${chalk.bold(dependencyExample.name)} ...`);

        return runDependencyWithWebpackPromise(dependencyExample.config).catch(function(err) {
          dependencyExample.error = err;
          logger.error(err);
        });
      })
      .then(function() {
        if (_.some(dependencyExamples, 'error')) {
          const err = new Error('Error running examples');
          err.examples = dependencyExamples;
          callback(err);
          return;
        }

        callback(null, dependencyExamples);
      });
    });
  });
}
