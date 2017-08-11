import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import Table from 'cli-table2';
import { each, every, extend, flatten, isArray, keys, map, some, values } from 'lodash';
import getLogger from '../lib/logger';
import { CANARY_CONFIG_FILENAME } from '../lib/consts';

export const logger = getLogger();

/**
 * Creates a list of webpack/dependency combinations
 *
 * @param {Object} config - Command config
 * @returns {Array} List of webpack/dependency combinations
 */
export const createRunList = function(config) {
  const nestedRunList = map(config.versions, function(dependencyVersions, webpackVersion) {
    return map(dependencyVersions, (dependencyVersion) => ({
      webpack: webpackVersion,
      dependency: dependencyVersion
    }));
  });
  return flatten(nestedRunList);
};

/**
 * Update the test results
 *
 * @param {Object} test - Test info
 * @param {Object} results - Test results
 * @param {Object} update - Updated data
 * @returns {Object} Test results
 */
const updateResults = function({ webpack, dependency, examples }, results, update) {
  results[webpack] = results[webpack] || {};
  results[webpack][dependency] = extend({
    webpack,
    dependency,
    examples
  }, update);
  return results;
};

/**
 * Add success results
 *
 * @param {Object} versions - Used versions
 * @param {Object} results - Results that need to be updated
 * @returns {Object} Updated results
 */
export const updateResultsForSuccess = function(versions, results) {
  return updateResults(versions, results, {
    success: true
  });
}

/**
 * Add failure results
 *
 * @param {Object} versions - Used versions
 * @param {Error} err - Failure reason
 * @param {Object} results - Results that need to be updated
 * @returns {Object} Updated results
 */
export const updateResultsForFailure = function(versions, err, results) {
  return updateResults(versions, results, {
    error: err,
    success: false
  });
}

/**
 * Prepare an error for output
 *
 * @param {Array|Error} err - Error to output
 * @returns {String} Prettified error
 */
const convertErrorToString = function(err) {
  if (isArray(err)) {
    return '\n' + flatten(err).join('\n');
  }
  return `\n${err}`;
};

/**
 * Output the task completion and exit
 *
 * @param {Object} results - Task results
 * @return {void}
 */
const completeTask = function(results) {
  const resultsList = flatten(values(results).map(values));

  if (some(resultsList, (result) => !result.success)) {
    logger.error('Compilation failures. Please review results above.');
    process.exit(1);
  }

  logger.success('Compilations complete. No issues detected.');
  process.exit();
};

/**
 * Generate the test summary
 *
 * @param {Object} results - Test results
 * @param {Number} startTime - Timestamp of the task start
 * @return {void}
 */
export const generateSummary = function(results, startTime) {
  each(results, function(webpackResults, webpackVersion) {
    logger.info(chalk.bold.underline(`Webpack ${webpackVersion}`));

    const table = new Table({
      head: ['Name', 'Example', 'Status'],
      style: { head: ['bold'] },
      wordWrap: true
    });

    if (every(webpackResults, (result) => result.success)) {
      logger.success(`No issues detected running ${keys(webpackResults).length} dependencies`);
      logger.newline();
      return;
    }

    each(webpackResults, function({ examples, error: dependencyError }, dependencyVersion) {
      const command = `node ./index.js --webpack=${webpackVersion} --dependency=${dependencyVersion}`;
      const commandRow = [{ colSpan: 3, content: command }];
      const passedMessage = chalk.green('Passed');
      const failedMessage = chalk.red('Failed');

      if (dependencyError) {
        const outputDependencyError = convertErrorToString(dependencyError);
        table.push(
          [dependencyVersion, '-', `${failedMessage}${outputDependencyError}`],
          commandRow
        );
        return;
      }

      each(examples, function({ name, error: exampleError }, index) {
        const exampleStatus = exampleError ? failedMessage : passedMessage;
        const outputExampleError = exampleError ? convertErrorToString(exampleError) : '';
        const isFirst = (index === 0);
        const nameColumn = isFirst ? [{ rowSpan: examples.length, content: dependencyVersion }] : [];
        table.push(
          nameColumn.concat([name, `${exampleStatus}${outputExampleError}`])
        );
      });

      table.push(commandRow);
    });

    logger.info(`${table}`);
    logger.newline();
  });

  const duration = new Date().getTime() - startTime;
  logger.info(`Run completed in ${duration}ms`)
  logger.newline();

  completeTask(results);
}

const checkConfigPath = function(filename) {
  const configPath = path.join(process.cwd(), filename);
  if (fs.existsSync(configPath)) { // eslint-disable-line no-sync
    return configPath;
  }
  return null;
}

export const loadConfig = function(argv) {
  let configPath;
  if (argv.config) {
    configPath = checkConfigPath(argv.config);
  }
  if (!configPath) {
    configPath = checkConfigPath(CANARY_CONFIG_FILENAME);
  }

  if (!configPath) {
    throw new Error(`Config file "${argv.config || CANARY_CONFIG_FILENAME}" was not found`);
  }

  const config = require(configPath);
  config.loglevel = config.loglevel || (argv.verbose ? 'debug' : 'silent');
  return config;
}
