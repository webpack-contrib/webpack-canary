import semver from 'semver';

import BaseInstallObject from './base';
import sources from '../sources';

class RegistryInstallObject extends BaseInstallObject {
  constructor(name, version = '') {
    super();
    this.name = name;
    this.version = semver.clean(version);
    this.source = sources.REGISTRY;
  }
}

export default RegistryInstallObject;
