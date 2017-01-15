import _ from 'underscore';
import semver from 'semver';
import sources from './sources';

const dependencyWithVersion = function(dependency) {
  const dependencyPieces = dependency.split('@');
  const versionSet = !_.isUndefined(dependencyPieces[1]);
  const cleanDependencyVersion = versionSet ? semver.clean(dependencyPieces[1]) : null;
  return {
    name: dependencyPieces[0],
    version: cleanDependencyVersion,
    source: sources.registry
  };
};

const dependencyFromRepo = function(dependency) {
  if (dependency[0] === '@') return {};
  if (dependency.indexOf('/') < 0) return {};

  const dependencyPieces = dependency.split('#');
  const branch = dependencyPieces[1];
  const dependencyNamePieces = dependencyPieces[0].split('/')
  const dependencyName = _.last(dependencyNamePieces);
  const dependencyPrefix = _.initial(dependencyNamePieces).join('/');

  return {
    name: dependencyName,
    branch: branch,
    prefix: dependencyPrefix,
    source: sources.repository
  };
};

class InstallObject {
  constructor(dependency) {
    const dependencyData = _.extend({},
      dependencyWithVersion(dependency),
      dependencyFromRepo(dependency)
    );

    _.forEach(dependencyData, (value, key) => {
      this[key] = value;
    });
  }

  hasVersion() {
    return _.isString(this.version);
  }

  getVersionSuffix() {
    return this.hasVersion() ? `@${this.version}` : '';
  }

  hasBranch() {
    return _.isString(this.branch);
  }

  getBranchSuffix() {
    return this.hasBranch() ? `#${this.branch}` : '';
  }

  toString() {
    if (this.source === sources.registry) {
      return `${this.name}${this.getVersionSuffix()}`;
    }

    if (this.source === sources.repository) {
      return `${this.prefix}/${this.name}${this.getBranchSuffix()}`;
    }

    return this.name;
  }

  toLocalName() {
    if (this.hasBranch()) {
      return this.name;
    }

    return this.toString();
  }
}

export default InstallObject;
