import Gauge from 'gauge';
import { has } from 'lodash';

import canaryRunner from '../lib/runner';
import { createRunList, generateSummary, logger, updateResultsForFailure, updateResultsForSuccess } from './utils';

const options = { loglevel: 'silent' };

/**
 * Run the squawk script
 *
 * @export
 * @return {Promise} Promise indicating the process success
 */
export default async function() {
  const runList = createRunList();
  let results = {};
  let pulsing;
  let previousWebpack;

  const gauge = new Gauge();
  const updateGauge = (webpack, value) => gauge.show(`${webpack}`, value / runList.length);
  gauge.show('webpack', 0);
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
        const examples = isExamplesError ? err.examples : undefined;
        const dependencyError = isExamplesError ? undefined : err;
        results = updateResultsForFailure({ webpack, dependency, examples }, dependencyError, results);
      }
    }

    setTimeout(function() {
      gauge.hide();
      generateSummary(results);
    }, 500);
  } catch (err) {
    gauge.hide();
    logger.error('Error ocurred running all combinations', err);
  }
}
