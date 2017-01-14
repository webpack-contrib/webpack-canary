var _ = require('underscore');
var semver = require('semver');

var dependencyWithVersion = function(dependency) {
  var dependencyPieces = dependency.split('@');
  var versionSet = !_.isUndefined(dependencyPieces[1]);
  var cleanDependencyVersion = versionSet ? semver.clean(dependencyPieces[1]) : null;
  return {
    name: dependencyPieces[0],
    version: cleanDependencyVersion,
    source: 'registry'
  };
};

var dependencyFromRepo = function(dependency) {
  if (dependency[0] === '@') return {};
  if (dependency.indexOf('/') < 0) return {};

  var dependencyPieces = dependency.split('#');
  var branch = dependencyPieces[1];
  var dependencyNamePieces = dependencyPieces[0].split('/')
  var dependencyName = _.last(dependencyNamePieces);
  var dependencyPrefix = _.initial(dependencyNamePieces);

  return {
    name: dependencyName,
    branch: branch,
    prefix: dependencyPrefix,
    source: 'repository'
  };
};

module.exports = function(dependency) {
  var dependencyData = _.extend({},
    dependencyWithVersion(dependency),
    dependencyFromRepo(dependency)
  );

  _.forEach(dependencyData, function(value, key) {
    this[key] = value;
  }, this)

  this.hasVersion = function() {
    return _.isString(this.version);
  };

  this.getVersionSuffix = function() {
    return this.hasVersion() ? '@' + this.version : '';
  };

  this.hasBranch = function() {
    return _.isString(this.branch);
  };

  this.getBranchSuffix = function() {
    return this.hasBranch() ? '#' + this.branch : '';
  };

  this.toString = function() {
    if (this.source === 'registry') {
      return this.name + this.getVersionSuffix();
    }

    if (this.source === 'repository') {
      return this.prefix + '/' + this.name + this.getBranchSuffix();
    }

    return this.name;
  };

  this.toLocalName = function() {
    if (this.hasBranch()) {
      return this.name;
    }

    return this.toString();
  };
};
