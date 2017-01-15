import path from 'path';
import _ from 'underscore';
import glob from 'glob';

export default function(webpackSetup, dependencySetup, callback) {
  const webpackConfigFilename = 'webpack.config.js';
  const examplesDirectoryName = 'examples';
  const dependencyExamplesPath = path.join(dependencySetup.toLocalName(), examplesDirectoryName);

  const globOptions = {
    cwd: path.join('node_modules', dependencyExamplesPath)
  };

  glob(`**/${webpackConfigFilename}`, globOptions, function(err, webpackConfigFilePaths) {
    if (err) {
      callback(err);
      return;
    }

    const dependencyExamples = _.map(webpackConfigFilePaths, function(webpackConfigFilePath) {
      const examplesName = path.dirname(webpackConfigFilePath);

      return {
        name: (examplesName === '.') ? undefined : examplesName,
        config: require(path.join(dependencyExamplesPath, webpackConfigFilePath))
      }
    });

    callback(null, dependencyExamples);
  });
};
