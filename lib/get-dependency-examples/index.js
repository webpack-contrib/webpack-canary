import path from 'path';
import Promise from 'bluebird';
import _ from 'underscore';
import glob from 'glob';

const globPromise = Promise.promisify(glob);

export default function(webpackSetup, dependencySetup, callback) {
  const webpackConfigFilename = 'webpack.config.js';
  const exampleDirectories = ['examples', 'example'];

  const exampleDirectoryPaths = _.map(exampleDirectories, function(exampleDirectory) {
    const dependencyExamplesPath = path.join(dependencySetup.toLocalName(), exampleDirectory);
    return path.join('node_modules', dependencyExamplesPath);
  });

  const exampleGlobs = _.map(exampleDirectoryPaths, function(examplePath) {
    return globPromise(`**/${webpackConfigFilename}`, { cwd: examplePath });
  });

  return Promise.all(exampleGlobs).then(function(groupedExamplePaths) {
    const webpackConfigFilePaths = _.flatten(_.map(groupedExamplePaths, function(examplePathGroup, index) {
      const exampleDirectory = exampleDirectoryPaths[index];
      return _.map(examplePathGroup, (examplePath) => ({ examplePath, exampleDirectory }));
    }));

    const dependencyExamples = _.map(webpackConfigFilePaths, function({ examplePath, exampleDirectory }) {
      const exampleName = path.dirname(examplePath);

      return {
        name: (exampleName === '.') ? undefined : exampleName,
        config: path.join(exampleDirectory, examplePath)
      }
    });

    callback(null, dependencyExamples);
    return dependencyExamples;
  })
  .catch(function(err) {
    callback(err);
    throw err;
  });
}
