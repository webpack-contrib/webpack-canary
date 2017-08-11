import path from 'path';
import { isEmpty, isString } from 'lodash';
import sources from '../sources';
import { MODULES } from '../../consts';

class BaseInstallObject {
  get hasVersion() {
    return isString(this.version);
  }

  /**
   * Returns a semver suffix
   *
   * @returns {String} Semver suffix
   * @memberof BaseInstallObject
   */
  get versionSuffix() {
    return this.hasVersion ? `@${this.version}` : '';
  }

  get hasBranch() {
    return isString(this.branch);
  }

  /**
   * Returns a repo branch siffux
   *
   * @returns {String} Repo branch suffix
   * @memberof BaseInstallObject
   */
  get branchSuffix() {
    return this.hasBranch ? `#${this.branch}` : '';
  }

  /**
   * Returns the location where the dependency is or will be installed
   *
   * @readonly
   * @memberof BaseInstallObject
   */
  get installLocation() {
    return path.join(MODULES, this.toLocalName());
  }

  /**
   * Returns the installation string
   *
   * @returns {String} The installation string
   * @memberof BaseInstallObject
   */
  toString() {
    if (this.source === sources.REGISTRY) {
      return `${this.name}${this.versionSuffix}`;
    }

    if (this.source === sources.REPOSITORY) {
      const suffix = isEmpty(this.suffix) ? '' : `/${this.suffix}`;
      return `${this.prefix}/${this.name}${this.branchSuffix}${suffix}`;
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
