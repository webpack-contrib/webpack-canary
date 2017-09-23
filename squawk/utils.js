import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import Table from 'cli-table2';
import { cloneDeep, each, every, extend, flatten, isArray, keys, map, some, values } from 'lodash';
import getLogger from '../lib/logger';
import { CANARY_CONFIG_FILENAME } from '../lib/consts';

let loggerInstance;

export function initLogger(options) {
  loggerInstance = getLogger(options.loglevel);
}

export const logger = loggerInstance;

/**
 * Creates a list of webpack/dependency combinations
 *
 * @param {Object} config - Command config
 * @returns {Array} List of webpack/dependency combinations
 */
export function createRunList(config) {
  const nestedRunList = map(config.versions,
    (dependencyVersions, webpackVersion) => map(dependencyVersions,
      (dependencyVersion) => {
        return {
          webpack: webpackVersion,
          dependency: dependencyVersion,
        };
      },
    ),
  );
  return flatten(nestedRunList);
}

/**
 * Update the test results
 *
 * @param {Object} test - Test info
 * @param {Object} results - Test results
 * @param {Object} update - Updated data
 * @returns {Object} Test results
 */
function updateResults({ webpack, dependency, examples, tests }, results, update) {
  const updated = cloneDeep(results);
  updated[webpack] = updated[webpack] || {};
  updated[webpack][dependency] = extend({
    webpack,
    dependency,
    examples,
    tests,
  }, update);
  return updated;
}

/**
 * Add success results
 *
 * @param {Object} versions - Used versions
 * @param {Object} results - Results that need to be updated
 * @param {Object} canaryOptions - Options for the canary runner
 * @returns {Object} Updated results
 */
export function updateResultsForSuccess(versions, results, canaryOptions) {
  return updateResults(versions, results, {
    success: true,
    options: canaryOptions,
  });
}

/**
 * Add failure results
 *
 * @param {Object} versions - Used versions
 * @param {Error} err - Failure reason
 * @param {Object} results - Results that need to be updated
 * @param {Object} canaryOptions - Options for the canary runner
 * @returns {Object} Updated results
 */
export function updateResultsForFailure(versions, err, results, canaryOptions) {
  return updateResults(versions, results, {
    error: err,
    success: false,
    options: canaryOptions,
  });
}

/**
 * Prepare an error for output
 *
 * @param {Array|Error} err - Error to output
 * @returns {String} Prettified error
 */
function convertErrorToString(err) {
  if (isArray(err)) {
    return `\n${flatten(err).join('\n')}`;
  }
  return `\n${err}`;
}

/**
 * Output the task completion and exit
 *
 * @param {Object} results - Task results
 * @return {void}
 */
function completeTask(results) {
  const resultsList = flatten(values(results).map(values));

  if (some(resultsList, result => !result.success)) {
    loggerInstance.error('Compilation failures. Please review results above.');
    process.exit(1);
  }

  loggerInstance.success('Compilations complete. No issues detected.');
  process.exit();
}

/**
 * Generate the test summary
 *
 * @param {Object} results - Test results
 * @param {Number} startTime - Timestamp of the task start
 * @return {void}
 */
export function generateSummary(results, startTime) {
  each(results, (webpackResults, webpackVersion) => {
    loggerInstance.info(chalk.bold.underline(`Webpack ${webpackVersion}`));

    const table = new Table({
      head: ['Name', 'Example', 'Status'],
      style: { head: ['bold'] },
      wordWrap: true,
    });

    if (every(webpackResults, result => result.success)) {
      loggerInstance.success(`No issues detected running ${keys(webpackResults).length} dependencies`);
      loggerInstance.newline();
      return;
    }

    each(webpackResults, ({ examples, tests, error: dependencyError, options = {} }, dependencyVersion) => {
      let command = `node ./index.js --webpack=${webpackVersion} --dependency=${dependencyVersion}`;
      if (options.test) {
        command += ` --test="${options.test}"`;
      }
      if (options.testPath) {
        command += ` --test-path="${options.testPath}"`;
      }
      if (options.exampleDir) {
        command += ` --example-dir"${options.exampleDir}"`;
      }

      const commandRow = [{ colSpan: 3, content: command }];
      const passedMessage = chalk.green('Passed');
      const failedMessage = chalk.red('Failed');

      if (dependencyError) {
        loggerInstance.debug(dependencyError.stack);
        const outputDependencyError = convertErrorToString(dependencyError);
        table.push(
          [dependencyVersion, '-', `${failedMessage}${outputDependencyError}`],
          commandRow,
        );
        return;
      }

      each(examples, ({ name, error: exampleError }, index) => {
        const exampleStatus = exampleError ? failedMessage : passedMessage;
        const outputExampleError = exampleError ? convertErrorToString(exampleError) : '';
        const isFirst = (index === 0);
        const nameColumn = isFirst ? [{ rowSpan: examples.length, content: dependencyVersion }] : [];
        table.push(
          nameColumn.concat([name, `${exampleStatus}${outputExampleError}`]),
        );
        if (exampleError) {
          loggerInstance.debug(exampleError.stack);
        }
      });

      each(tests, ({ error: testError }, index) => {
        const testsStatus = testError ? failedMessage : passedMessage;
        const outputTestError = testError ? convertErrorToString(testError) : '';
        const isFirst = (index === 0);
        const nameColumn = isFirst ? [{ rowSpan: tests.length, content: dependencyVersion }] : [];
        table.push(
          nameColumn.concat([`Test: ${options.test}`, `${testsStatus}${outputTestError}`]),
        );
        if (testError && testError.stack) {
          loggerInstance.debug(testError.stack);
        }
      });

      table.push(commandRow);
    });

    loggerInstance.info(`${table}`);
    loggerInstance.newline();
  });

  const duration = new Date().getTime() - startTime;
  loggerInstance.info(`Run completed in ${duration}ms`);
  loggerInstance.newline();

  completeTask(results);
}

function checkConfigPath(filename) {
  const configPath = path.join(process.cwd(), filename);
  if (fs.existsSync(configPath)) { // eslint-disable-line no-sync
    return configPath;
  }
  throw new Error(`Config file "${filename}" was not found`);
}

export function loadConfig(argv) {
  const configPath = checkConfigPath(argv.config || CANARY_CONFIG_FILENAME);

  const config = require(configPath); // eslint-disable-line import/no-dynamic-require, global-require
  config.loglevel = config.loglevel || (argv.verbose ? 'debug' : 'silent');
  return config;
}
