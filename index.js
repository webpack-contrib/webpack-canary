var path = require('path');
var argv = require('yargs').argv;
var generateInstallObjectFor = require('./lib/generate-install-object');
var installWebpackAndLoader = require('./lib/install-webpack-and-loader');
var runLoaderWithWebpack = require('./lib/run-loader-with-webpack');

var getLoaderExampleConfig = function(webpackSetup, loaderSetup) {
  // TODO: Think about different examples for different webpack versions
  return require(path.join(loaderSetup.name, 'examples', 'webpack.config.js'));
};

var compileComplete = function(err) {
  if (err) throw err;

  console.log('Success!');
};

var webpackSetup = generateInstallObjectFor.webpack(argv.webpack);
if (webpackSetup === null) {
  throw new Error('Webpack version is not valid');
}

var loaderSetup = generateInstallObjectFor.loader(argv.loader);
if (loaderSetup === null) {
  throw new Error('Loader details provided are not valid');
}

installWebpackAndLoader(webpackSetup, loaderSetup, function(err) {
  if (err) throw err;

  // TODO: Support multiple examples
  var loaderExampleConfig = getLoaderExampleConfig(webpackSetup, loaderSetup);
  runLoaderWithWebpack(loaderExampleConfig, compileComplete);
});
