import { isEmpty, isString } from 'lodash';

import sources from '../sources';

class BaseInstallObject {
  hasVersion() {
    return isString(this.version);
  }

  getVersionSuffix() {
    return this.hasVersion() ? `@${this.version}` : '';
  }

  hasBranch() {
    return isString(this.branch);
  }

  getBranchSuffix() {
    return this.hasBranch() ? `#${this.branch}` : '';
  }

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

  toLocalName() {
    return this.name;
  }
}

export default BaseInstallObject;
