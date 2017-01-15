import _ from 'underscore';
import Promise from "bluebird";
import chalk from 'chalk';
import logger from './logger';
import generateInstallObjectFor from './generate-install-object';
import installWebpackAndDependency from './install-webpack-and-dependency';
import getDependencyExamples from './get-dependency-examples';
import runDependencyWithWebpack from './run-dependency-with-webpack';

export default function(webpackVersion, dependencyVersion) {
  const runDependencyWithWebpackPromise = Promise.promisify(runDependencyWithWebpack);

  const fatalError = function(...args) {
    logger.error(...args);
    process.exit(1);
  };

  const dependencyExampleFailure = function(err) {
    fatalError(err);
  };

  const dependencyExamplesSuccess = function() {
    logger.success('All examples passed');
  };

  const webpackSetup = generateInstallObjectFor.webpack(webpackVersion);
  if (_.isNull(webpackSetup) || webpackSetup.name !== 'webpack') {
    logger.error('Webpack version is not valid', webpackVersion);
    return;
  }

  const dependencySetup = generateInstallObjectFor.dependency(dependencyVersion);
  if (_.isNull(dependencySetup)) {
    fatalError('Dependency details provided are not valid', dependencyVersion);
    return;
  }

  logger.info(`Installing ${chalk.bold(webpackSetup)} and ${chalk.bold(dependencySetup)} ...`);
  installWebpackAndDependency(webpackSetup, dependencySetup, function(err) {
    if (err) {
      fatalError(err);
      return;
    }

    logger.info(`Retrieving ${chalk.bold(dependencySetup.name)} examples ...`);
    getDependencyExamples(webpackSetup, dependencySetup, function(err, dependencyExamples) {
      if (err) {
        fatalError(err);
        return;
      }

      if (_.isEmpty(dependencyExamples)) {
        fatalError('Unable to get any dependency examples');
        return;
      }

      logger.info(`Running ${chalk.bold(dependencySetup)} with ${chalk.bold(webpackSetup)} ...`);

      Promise.each(dependencyExamples, function(dependencyExample, index) {
        const exampleName = dependencyExample.name || `example ${index + 1}`;
        logger.info(` - ${dependencySetup.name} ${chalk.bold(exampleName)} ...`);

        return runDependencyWithWebpackPromise(dependencyExample.config);
      })
      .then(dependencyExamplesSuccess)
      .catch(dependencyExampleFailure);
    });
  });
}
