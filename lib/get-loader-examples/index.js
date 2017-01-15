import path from 'path';
import _ from 'underscore';
import glob from 'glob';

export default function(webpackSetup, loaderSetup, callback) {
  const webpackConfigFilename = 'webpack.config.js';
  const examplesDirectoryName = 'examples';
  const loaderExamplesPath = path.join(loaderSetup.toLocalName(), examplesDirectoryName);

  const globOptions = {
    cwd: path.join('node_modules', loaderExamplesPath)
  };

  glob(`**/${webpackConfigFilename}`, globOptions, function(err, webpackConfigFilePaths) {
    if (err) {
      callback(err);
      return;
    }

    const loaderExamples = _.map(webpackConfigFilePaths, function(webpackConfigFilePath) {
      const examplesName = path.dirname(webpackConfigFilePath);

      return {
        name: (examplesName === '.') ? undefined : examplesName,
        config: require(path.join(loaderExamplesPath, webpackConfigFilePath))
      }
    });

    callback(null, loaderExamples);
  });
};
