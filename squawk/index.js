#!/usr/bin/env node

import Gauge from 'gauge';
import { has } from 'lodash';
import { argv } from 'yargs';
import canaryRunner from '../canary/runner';
import { argvToOptions } from '../canary/utils';
import { createRunList, generateSummary, initLogger, loadConfig, updateResultsForFailure, updateResultsForSuccess } from './utils';

const options = argvToOptions(argv, 'silent');

const logger = initLogger(options);

/**
 * Run the squawk script
 *
 * @return {Promise} Promise indicating the process success
 */
async function runner() {
  const config = loadConfig(argv);
  const startTime = new Date().getTime();
  const runList = createRunList(config);
  let results = {};
  let pulsing;
  let previousWebpack;

  const gauge = new Gauge();
  const updateGauge = (webpack, value) => !argv.verbose && gauge.show(`${webpack}`, value / runList.length);
  if (!argv.verbose) {
    gauge.show('webpack', 0);
  }

  try {
    for (const runItem of runList) {
      const index = runList.indexOf(runItem);
      const { webpack, dependency: depOptions } = runItem;
      const { dependency } = depOptions;
      const canaryOptions = Object.assign({}, options, config, depOptions);

      const webpackText = `${webpack}`;
      clearInterval(pulsing);
      updateGauge(webpack, index);
      if (previousWebpack !== webpackText) gauge.pulse('');
      pulsing = setInterval(() => gauge.pulse(`${dependency}`), 75);
      previousWebpack = webpackText;

      try {
        const examples = await canaryRunner(webpack, dependency, canaryOptions);
        updateGauge(webpack, (index + 1));
        results = updateResultsForSuccess({ webpack, dependency, examples }, results, canaryOptions);
      } catch (err) {
        updateGauge(webpack, (index + 1));
        const isExamplesError = has(err, 'examples');
        const isTestsError = has(err, 'tests');
        const examples = isExamplesError ? err.examples : null;
        const tests = isTestsError ? err.tests : null;
        const dependencyError = (isExamplesError || isTestsError) ? null : err;
        results = updateResultsForFailure({ webpack, dependency, examples, tests }, dependencyError, results, canaryOptions);
      }
    }

    setTimeout(() => {
      gauge.hide();
      generateSummary(results, startTime);
    }, 500);
  } catch (err) {
    gauge.hide();
    logger.error('Error ocurred running all combinations', err);
  }
}

runner()
  .catch((error) => {
    logger.error('Errors have occurred running examples');
    logger.error(error instanceof Error ? error.err || error.message : error);
    process.exit(1);
  });
