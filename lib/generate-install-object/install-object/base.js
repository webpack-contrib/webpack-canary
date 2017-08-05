import { isEmpty, isString } from 'lodash';

import sources from '../sources';

class BaseInstallObject {
  hasVersion() {
    return isString(this.version);
  }

  /**
   * Returns a semver suffix
   *
   * @returns {String} Semver suffix
   * @memberof BaseInstallObject
   */
  getVersionSuffix() {
    return this.hasVersion() ? `@${this.version}` : '';
  }

  hasBranch() {
    return isString(this.branch);
  }

  /**
   * Returns a repo branch siffux
   *
   * @returns {String} Repo branch suffix
   * @memberof BaseInstallObject
   */
  getBranchSuffix() {
    return this.hasBranch() ? `#${this.branch}` : '';
  }

  /**
   * Returns the installation string
   *
   * @returns {String} The installation string
   * @memberof BaseInstallObject
   */
  toString() {
    if (this.source === sources.REGISTRY) {
      return `${this.name}${this.getVersionSuffix()}`;
    }

    if (this.source === sources.REPOSITORY) {
      const suffix = isEmpty(this.suffix) ? '' : `/${this.suffix}`;
      return `${this.prefix}/${this.name}${this.getBranchSuffix()}${suffix}`;
    }

    return this.name;
  }

  /**
   * Returns the module name
   *
   * @returns {String} Module name
   * @memberof BaseInstallObject
   */
  toLocalName() {
    return this.name;
  }
}

export default BaseInstallObject;
