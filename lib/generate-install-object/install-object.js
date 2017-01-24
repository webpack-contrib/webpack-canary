import url from 'url';
import _ from 'underscore';
import semver from 'semver';
import sources from './sources';

const unknownDependencySource = function() {
  return {
    source: sources.unknown
  };
}

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

const dependencyFromRepo = function(dependencyString) {
  if (dependencyString[0] === '@') return {};
  if (dependencyString.indexOf('/') < 0) return {};

  const dependency = url.parse(dependencyString);
  const branch = _.isNull(dependency.hash) ? undefined : dependency.hash.replace(/^#/, '');
  const dependencyNamePieces = dependency.path.replace(/^\//, '').split('/');
  const dependencyName = dependencyNamePieces[1];
  const domain = `${dependency.protocol}//${dependency.host}`;
  const dependencyPrefix = (_.isNull(dependency.host) ? '' : `${domain}/`) + dependencyNamePieces[0];
  const dependencySuffix = dependencyNamePieces.slice(2).join('/');

  return {
    name: dependencyName,
    branch: branch,
    prefix: dependencyPrefix,
    suffix: dependencySuffix,
    source: sources.repository
  };
};

class InstallObject {
  constructor(dependency) {
    const dependencyData = _.extend({},
      unknownDependencySource(dependency),
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
      const suffix = _.isEmpty(this.suffix) ? '' : `/${this.suffix}`;
      return `${this.prefix}/${this.name}${this.getBranchSuffix()}${suffix}`;
    }

    return this.name;
  }

  toLocalName() {
    return this.name;
  }
}

export default InstallObject;
