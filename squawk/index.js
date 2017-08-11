import Gauge from 'gauge';
import { has } from 'lodash';
import { argv } from 'yargs';
import canaryRunner from '../lib/runner';
import { createRunList, generateSummary, logger, updateResultsForFailure, updateResultsForSuccess } from './utils';

const options = argv.verbose ? { loglevel: 'debug' } : { loglevel: 'silent' };

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
      const { webpack, dependency } = runItem;

      const webpackText = `${webpack}`;
      clearInterval(pulsing);
      updateGauge(webpack, index);
      if (previousWebpack !== webpackText) gauge.pulse('');
      pulsing = setInterval(() => gauge.pulse(`${dependency}`), 75);
      previousWebpack = webpackText;

      try {
        const examples = await canaryRunner(webpack, dependency, options);
        updateGauge(webpack, (index + 1));
        results = updateResultsForSuccess({ webpack, dependency, examples }, results);
      } catch (err) {
        updateGauge(webpack, (index + 1));
        const isExamplesError = has(err, 'examples');
        const examples = isExamplesError ? err.examples : null;
        const dependencyError = isExamplesError ? null : err;
        results = updateResultsForFailure({ webpack, dependency, examples }, dependencyError, results);
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
