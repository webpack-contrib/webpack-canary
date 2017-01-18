import Promise from 'bluebird';
import Gauge from 'gauge';
import _ from 'underscore';
import chalk from 'chalk';
import Table from 'cli-table2';
import getLogger from '../lib/logger';
import versionMapping from './webpack-to-dependency-versions';
import canary from '../lib';

const squawk = Promise.promisify(canary);
const options = { loglevel: 'silent' };
const logger = getLogger();
const createRunList = function() {
  const nestedRunList = _.map(versionMapping, function(dependencyVersions, webpackVersion) {
    return _.map(dependencyVersions, function(dependencyVersion) {
      return {
        webpack: webpackVersion,
        dependency: dependencyVersion
      };
    });
  });
  return _.flatten(nestedRunList);
};

const updateResults = function({ webpack, dependency, examples }, results, update) {
  results[webpack] = results[webpack] || {};
  results[webpack][dependency] = _.extend({
    webpack,
    dependency,
    examples
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
    return '\n' + _.flatten(err).join('\n');
  }
  return `\n${err}`;
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
    logger.info(chalk.bold.underline(`Webpack ${webpackVersion}`));

    const table = new Table({
      head: ['Name', 'Example', 'Status'],
      style: { head: ['bold'] },
      wordWrap: true
    });

    if (_.every(webpackResults, (result) => result.success)) {
      logger.success(`No issues detected running ${_.keys(webpackResults).length} dependencies`);
      logger.newline();
      return;
    }

    _.each(webpackResults, function({ success, examples, error: dependencyError }, dependencyVersion) {
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

      _.each(examples, function({ name, error: exampleError }, index) {
        const exampleStatus = exampleError ? failedMessage : passedMessage;
        const outputExampleError = exampleError ? convertErrorToString(exampleError) : '';
        const isFirst = (index === 0);
        const nameColumn = isFirst ? [{rowSpan: examples.length, content: dependencyVersion}] : [];
        table.push(
          nameColumn.concat([name, `${exampleStatus}${outputExampleError}`])
        );
      });

      table.push(commandRow);
    });

    logger.info(`${table}`);
    logger.newline();
  });

  completeTask(results);
};

export default function() {
  const gauge = new Gauge();
  const updateGauge = (webpack, value) => gauge.show(`${webpack}`, value / runList.length);
  gauge.show('webpack', 0);

  const runList = createRunList();
  let results = {};
  let plusing;
  let previousWebpack;

  Promise.each(runList, function({ webpack, dependency }, index) {
    const webpackText = `${webpack}`;
    clearInterval(plusing);
    updateGauge(webpack, index);
    if (previousWebpack !== webpackText) gauge.pulse('');
    plusing = setInterval(() => gauge.pulse(`${dependency}`), 75);
    previousWebpack = webpackText;

    return squawk(webpack, dependency, options).then(function(examples) {
      updateGauge(webpack, (index + 1));
      results = updateResultsForSuccess({ webpack, dependency, examples }, results);
    }).catch(function(err) {
      updateGauge(webpack, (index + 1));
      const isExamplesError = _.has(err, 'examples');
      const examples = isExamplesError ? err.examples : undefined;
      const dependencyError = isExamplesError ? undefined : err;
      results = updateResultsForFailure({ webpack, dependency, examples }, dependencyError, results);
    });
  }).then(function() {
    setTimeout(function() {
      gauge.hide();
      generateSummary(results);
    }, 500);
  }).catch(function(err) {
    gauge.hide();
    logger.error('Error ocurred running all combinations', err);
  });
}
