import Gauge from 'gauge';
import { has } from 'lodash';
import { argv } from 'yargs';
import canaryRunner from '../lib/runner';
import { argvToOptions } from '../lib/utils';
import { createRunList, generateSummary, initLogger, logger, updateResultsForFailure, updateResultsForSuccess } from './utils';

const options = argvToOptions(argv, 'silent');

initLogger(options);

/**
 * Run the squawk script
 *
 * @export
 * @return {Promise} Promise indicating the process success
 */
export default async function () {
  const startTime = new Date().getTime();
  const runList = createRunList();
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
      const { webpack, depOptions } = runItem;
      const { dependency } = depOptions;
      const canaryOptions = Object.assign({
        exampleDirs: depOptions.exampleDir ? [].concat(depOptions.exampleDir) : null,
      }, options, depOptions);

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
