import chalk from 'chalk';
import Table from 'cli-table2';
import { each, every, extend, flatten, isArray, keys, map, some, values } from 'lodash';

import getLogger from '../lib/logger';
import versionMapping from './webpack-to-dependency-versions';

export const logger = getLogger();

export const createRunList = function() {
  const nestedRunList = map(versionMapping, function(dependencyVersions, webpackVersion) {
    return map(dependencyVersions, (dependencyVersion) => ({
      webpack: webpackVersion,
      dependency: dependencyVersion
    }));
  });
  return flatten(nestedRunList);
};

const updateResults = function({ webpack, dependency, examples }, results, update) {
  results[webpack] = results[webpack] || {};
  results[webpack][dependency] = extend({
    webpack,
    dependency,
    examples
  }, update);
  return results;
};

export const updateResultsForSuccess = function(versions, results) {
  return updateResults(versions, results, {
    success: true
  });
}

export const updateResultsForFailure = function(versions, err, results) {
  return updateResults(versions, results, {
    error: err,
    success: false
  });
}

const convertErrorToString = function(err) {
  if (isArray(err)) {
    return '\n' + flatten(err).join('\n');
  }
  return `\n${err}`;
};

const completeTask = function(results) {
  const resultsList = flatten(values(results).map(values));

  if (some(resultsList, (result) => !result.success)) {
    logger.error('Compilation failures. Please review results above.');
    process.exit(1);
  }

  logger.success('Compilations complete. No issues detected.');
  process.exit();
};

export const generateSummary = function(results) {
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

  completeTask(results);
}
