import semver from 'semver';
import sources from '../sources';
import BaseInstallObject from './base';

/**
 * Contains the registryInstallation info for the module
 *
 * @class RegistryInstallObject
 * @extends {BaseInstallObject}
 */
class RegistryInstallObject extends BaseInstallObject {
  /**
   * Creates an instance of RegistryInstallObject
   * @param {any} name - Name of the module
   * @param {string} [version=''] - Version of the module
   * @memberof RegistryInstallObject
   */
  constructor(name, version = '') {
    super();
    this.name = name;
    this.version = semver.clean(version);
    this.source = sources.REGISTRY;
  }
}

export default RegistryInstallObject;
