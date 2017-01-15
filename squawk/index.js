import Promise from 'bluebird';
import _ from 'underscore';
import chalk from 'chalk';
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
}

export default function() {
  const runList = createRunList();
  Promise.each(runList, function({ webpack, dependency }) {
    logger.info(`Running ${chalk.bold(webpack)} and ${chalk.bold(dependency)} ...`);
    return squawk(webpack, dependency, options).catch(function(err) {
      logger.error(err);
    });
  })
  .then(function() {
    logger.info('Complete');
  })
  .catch(function(err) {
    logger.error('Error ocurred running all combinations', err);
  });
}
