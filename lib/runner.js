import chalk from 'chalk';
import { isEmpty, isNull, some } from 'lodash';
import getLogger from './logger';
import generateInstallObjectFor from './generate-install-object';
import installWebpackAndDependency from './install-webpack-and-dependency';
import getDependencyExamples from './get-dependency-examples';
import runDependencyWithWebpack from './run-dependency-with-webpack';
import { progressStart, progressUpdate, progressStop } from './utils';

/**
 * Run the canary script
 *
 * @export
 * @param {String} webpackVersion - Entered Webpack version info
 * @param {String} dependencyVersion - Entered dependency info
 * @param {Object} options - CLI options
 * @returns {Promise} Promise indicating the process success
 */
export default async function canaryRunner(webpackVersion, dependencyVersion, options) {
  const logger = getLogger(options.loglevel);

  progressStart('Parsing webpack version', options);

  const webpackSetup = generateInstallObjectFor.webpack(webpackVersion);
  if (isNull(webpackSetup) || webpackSetup.name !== 'webpack') {
    const error = new Error();
    error.err = ['Webpack version is not valid', webpackVersion];
    throw error;
  }

  progressUpdate('Parsing dependency version', 1, 4);

  const dependencySetup = generateInstallObjectFor.dependency(dependencyVersion);
  if (isNull(dependencySetup)) {
    const error = new Error();
    error.err = ['Dependency details provided are not valid', dependencyVersion];
    throw error;
  }

  progressUpdate('Installing packages', 2, 4);

  logger.info(`Installing ${chalk.bold(webpackSetup)} and ${chalk.bold(dependencySetup)} ...`);

  const startInstall = new Date().getTime();
  logger.debug('Start install');
  await installWebpackAndDependency(webpackSetup, dependencySetup, options.packageManager);
  const finishInstall = new Date().getTime();
  logger.debug(`Finished install (${finishInstall - startInstall}ms)`);

  logger.info(`Retrieving ${chalk.bold(dependencySetup.name)} examples ...`);

  progressUpdate('Getting examples', 3, 4);

  const startGetExamples = new Date().getTime();
  logger.debug('Start get examples');
  const dependencyExamples = await getDependencyExamples(webpackSetup, dependencySetup, options.exampleDirs);
  const finishGetExamples = new Date().getTime();
  logger.debug(`Finished get examples (${finishGetExamples - startGetExamples}ms)`);

  if (isEmpty(dependencyExamples)) {
    const error = new Error();
    error.err = 'Unable to get any dependency examples';
    throw error;
  }

  logger.info(`Running ${chalk.bold(dependencySetup)} with ${chalk.bold(webpackSetup)} ...`);
  progressUpdate('Running examples', 4, 4 + dependencyExamples.length);

  for (const dependencyExample of dependencyExamples) {
    const index = dependencyExamples.indexOf(dependencyExample);
    progressUpdate(`Running example ${index + 1}`, 4 + index, 4 + dependencyExamples.length);
    dependencyExample.name = dependencyExample.name || `example ${index + 1}`;
    logger.info(` - ${dependencySetup.name} ${chalk.bold(dependencyExample.name)} ...`);

    try {
      const startRunExample = new Date().getTime();
      logger.debug('Start run example');

      await runDependencyWithWebpack(dependencyExample.config);

      const finishRunExample = new Date().getTime();
      logger.debug(`Finished run example (${finishRunExample - startRunExample}ms)`);
    } catch (err) {
      dependencyExample.error = err;
      logger.error(err);
    }
  }

  if (some(dependencyExamples, 'error')) {
    const err = new Error('Error running examples');
    err.examples = dependencyExamples;
    throw err;
  }

  progressStop();

  return dependencyExamples;
}
