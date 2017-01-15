import _ from 'underscore';
import Promise from "bluebird";
import chalk from 'chalk';
import yargs from 'yargs';
import logger from './logger';
import generateInstallObjectFor from './generate-install-object';
import installWebpackAndDependency from './install-webpack-and-dependency';
import getDependencyExamples from './get-dependency-examples';
import runDependencyWithWebpack from './run-dependency-with-webpack';

export default function() {
  const runDependencyWithWebpackPromise = Promise.promisify(runDependencyWithWebpack);
  const { argv } = yargs;

  const dependencyExampleFailure = function(err) {
    logger.error(err);
    process.exit(1);
  };

  const dependencyExamplesSuccess = function() {
    logger.success('All examples passed');
    process.exit()
  };

  const webpackSetup = generateInstallObjectFor.webpack(argv.webpack);
  if (_.isNull(webpackSetup) || webpackSetup.name !== 'webpack') {
    logger.error('Webpack version is not valid', argv.webpack);
    return;
  }

  const dependencySetup = generateInstallObjectFor.dependency(argv.dependency);
  if (_.isNull(dependencySetup)) {
    logger.error('Dependency details provided are not valid', argv.dependency);
    return;
  }

  logger.info(`Installing ${chalk.bold(webpackSetup)} and ${chalk.bold(dependencySetup)} ...`);
  installWebpackAndDependency(webpackSetup, dependencySetup, function(err) {
    if (err) {
      logger.error(err);
      return;
    }

    logger.info(`Retrieving ${chalk.bold(dependencySetup.name)} examples ...`);
    getDependencyExamples(webpackSetup, dependencySetup, function(err, dependencyExamples) {
      if (err) {
        logger.error(err);
        return;
      }

      if (_.isEmpty(dependencyExamples)) {
        logger.error('Unable to get any dependency examples');
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
