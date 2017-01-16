import Promise from 'bluebird';
import _ from 'underscore';
import chalk from 'chalk';
import Table from 'cli-table';
import getLogger from '../lib/logger';
import webpackVersions from './webpack-versions';
import dependencyVersions from './dependency-versions';
import canary from '../lib';

const squawk = Promise.promisify(canary);
const options = { logLevel: 'silent' };
const logger = getLogger();
const createRunList = function() {
  const nestedRunList = _.map(webpackVersions, function(webpackVersion) {
    return _.map(dependencyVersions, function(dependencyVersion) {
      return {
        webpack: webpackVersion,
        dependency: dependencyVersion
      };
    });
  });
  return _.flatten(nestedRunList);
};

const updateResults = function({ webpack, dependency }, results, update) {
  results[webpack] = results[webpack] || {};
  results[webpack][dependency] = _.extend({
    webpack,
    dependency
  }, update);
  return results;
};

const updateResultsForSuccess = function(versions, results) {
  return updateResults(versions, results, {
    success: true
  });
};

const updateResultsForFailure = function(versions, err, results) {
  return updateResults(versions, results, {
    error: err,
    success: false
  });
}

const convertErrorToString = function(err) {
  if (_.isArray(err)) {
    return _.flatten(err).join('\n');
  }
  return err;
};

const completeTask = function(results) {
  const resultsList = _.flatten(_.map(_.values(results), (dependencies) => _.values(dependencies)));

  if (_.some(resultsList, (result) => !result.success)) {
    logger.error('Compilation failures. Please review results above.');
    process.exit(1);
  }

  logger.success('Compilations complete. No issues detected.');
  process.exit();
};

const generateSummary = function(results) {
  _.each(results, function(webpackResults, webpackVersion) {
    console.log(chalk.bold.underline(`Webpack ${webpackVersion}`));

    const table = new Table({
      head: ['Status', 'Name', 'Error'],
      style: { head: ['bold'] }
    });

    _.each(webpackResults, function({ success, error }, dependencyVersion) {
      const dependencyStatus = success ? chalk.green('Passed') : chalk.red('Failed');
      const dependencyError = error ? chalk.red(convertErrorToString(error)) : '';
      table.push(
        [dependencyStatus, dependencyVersion, dependencyError]
      );
    });

    console.log(`${table}\n`);
  });

  completeTask(results);
};

export default function() {
  const runList = createRunList();
  let results = {};

  Promise.each(runList, function({ webpack, dependency }) {
    logger.info(`Running ${chalk.bold(webpack)} and ${chalk.bold(dependency)} ...`);
    return squawk(webpack, dependency, options).then(function() {
      results = updateResultsForSuccess({ webpack, dependency }, results);
    }).catch(function(err) {
      results = updateResultsForFailure({ webpack, dependency }, err, results);
    });
  }).then(function() {
    generateSummary(results);
  }).catch(function(err) {
    logger.error('Error ocurred running all combinations', err);
  });
}
