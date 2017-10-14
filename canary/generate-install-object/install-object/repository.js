import url from 'url';
import { isNull } from 'lodash';
import sources from '../sources';
import BaseInstallObject from './base';

/**
 * Contains the repository installation info for the module
 *
 * @class RegistryInstallObject
 * @extends {BaseInstallObject}
 */
class RegistryInstallObject extends BaseInstallObject {
  /**
   * Creates an instance of RegistryInstallObject.
   * @param {any} dependencyString - Entered module reference (url or github)
   * @memberof RegistryInstallObject
   */
  constructor(dependencyString) {
    super();

    const dependency = url.parse(dependencyString);
    const branch = isNull(dependency.hash) ? null : dependency.hash.replace(/^#/, '');
    const dependencyNamePieces = dependency.path.replace(/^\//, '').split('/');
    const [, dependencyName] = dependencyNamePieces;
    const domain = `${dependency.protocol}//${dependency.host}`;
    const dependencyPrefix = (isNull(dependency.host) ? '' : `${domain}/`) + dependencyNamePieces[0];
    const dependencySuffix = dependencyNamePieces.slice(2).join('/');

    this.name = dependencyName;
    this.branch = branch;
    this.prefix = dependencyPrefix;
    this.suffix = dependencySuffix;
    this.source = sources.REPOSITORY;
  }
}

export default RegistryInstallObject;
