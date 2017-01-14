var path = require('path');
var exec = require('child_process').exec;
var argv = require('yargs').argv;
var semver = require('semver');
var npmSafeName = require('npm-safe-name');

var InstallObject = function(name, version) {
  this.name = name;
  this.version = version;
  this.toString = function() {
    return name + '@' + version;
  }
};

var getWebpackInstallObject = function(webpackVersion) {
  if (typeof webpackVersion !== 'string') return null;

  var cleanWebpackVersion = semver.clean(webpackVersion);
  if (semver.valid(cleanWebpackVersion) === null) return null;

  return new InstallObject('webpack', cleanWebpackVersion);
}

var getLoaderInstallObject = function(loader) {
  if (typeof loader !== 'string') return null;

  var loaderPieces = loader.split('@');
  if (npmSafeName(loaderPieces[0]) === null) return null;

  var versionSet = (typeof loaderPieces[1] !== 'undefined');
  var cleanLoaderVersion = versionSet ? semver.clean(loaderPieces[1]) : undefined;
  if (versionSet && semver.valid(cleanLoaderVersion) === null) return null;

  return new InstallObject(loaderPieces[0], cleanLoaderVersion || 'latest');
};

var getLoaderExampleConfig = function(webpackSetup, loaderSetup) {
  // TODO: Think about different examples for different webpack versions
  return require(path.join(loaderSetup.name, 'examples', 'webpack.config.js'));
};

var successfullyCompiled = function() {
  console.log('Success!');
};

var runLoaderWithWebpack = function(config) {
  var webpack = require('webpack');
  var compiler = webpack(config);

  compiler.run(function(err, stats) {
    if (err) {
      new Error('Error running webpack', err);
    }

    var jsonStats = stats.toJson();
    if (jsonStats.errors.length > 0) {
      new Error('Errors output during compilation', jsonStats.errors);
    }


    if (jsonStats.warnings.length > 0) {
      new Error('Warnings output during compilation', jsonStats.warnings);
    }

    successfullyCompiled();
  });
};

// --------------------------

var webpackSetup = getWebpackInstallObject(argv.webpack);
if (webpackSetup === null) {
  throw new Error('Webpack version is not valid');
}

var loaderSetup = getLoaderInstallObject(argv.loader);
if (loaderSetup === null) {
  throw new Error('Loader details provided are not valid');
}

var installCommand = 'npm install ' + webpackSetup + ' ' + loaderSetup;

exec(installCommand, function (err, stdout, stderr) {
  if (err) {
    throw new Error('Error calling install command', err);
  }

  if (stderr) {
    throw new Error('Error output when installing', stderr);
  }

  if (stdout.indexOf(webpackSetup.toString()) === -1 ||
      stdout.indexOf(loaderSetup.toString()) === -1) {
    throw new Error('Expected versions not displayed in dependency tree', stdout);
  }

  // TODO: Support multiple examples
  var loaderExampleConfig = getLoaderExampleConfig(webpackSetup, loaderSetup);
  runLoaderWithWebpack(loaderExampleConfig);
});
