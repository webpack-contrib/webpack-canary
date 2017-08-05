import { isEmpty, isString } from 'lodash';

import RegistryInstallObject from './registry';
import RepositoryInstallObject from './repository';

const isValidInput = function (input) {
  return isString(input) && !isEmpty(input);
};

const isValidRepoString = function (value) {
  return value[0] !== '@' && value.indexOf('/') > -1;
}

export default function createInstallObject(dependencyString, isWebpack) {
  if (!isValidInput(dependencyString)) return null;

  if (isValidRepoString(dependencyString)) {
    return new RepositoryInstallObject(dependencyString);
  }

  const [name, version] = dependencyString.split('@');
  if (isWebpack && !isString(version)) {
    return new RegistryInstallObject('webpack', name);
  }
  return new RegistryInstallObject(name, version);
}
