import _ from 'underscore';
import Promise from "bluebird";
import chalk from 'chalk';
import logger from './logger';
import generateInstallObjectFor from './generate-install-object';
import installWebpackAndDependency from './install-webpack-and-dependency';
import getDependencyExamples from './get-dependency-examples';
import runDependencyWithWebpack from './run-dependency-with-webpack';

export default function(webpackVersion, dependencyVersion, callback) {
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
        const exampleName = dependencyExample.name || `example ${index + 1}`;
        logger.info(` - ${dependencySetup.name} ${chalk.bold(exampleName)} ...`);

        return runDependencyWithWebpackPromise(dependencyExample.config);
      })
      .then(function() {
        callback();
      })
      .catch(function(err) {
        callback(err);
      });
    });
  });
}
