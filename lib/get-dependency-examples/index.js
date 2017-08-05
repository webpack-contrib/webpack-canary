import glob from 'glob-promise';

import { WEBPACK_CONFIG_FILENAME } from '../consts';
import { getDependencyExamples, getExampleDirectoryPaths } from './utils';

const createExampleGlob = function(examplePath) {
  return glob(`**/${WEBPACK_CONFIG_FILENAME}`, { cwd: examplePath });
}

export default function(webpackSetup, dependencySetup) {
  const exampleDirectoryPaths = getExampleDirectoryPaths(dependencySetup);
  const exampleGlobs = exampleDirectoryPaths.map(createExampleGlob);

  return Promise.all(exampleGlobs).then(getDependencyExamples(exampleDirectoryPaths));
}
