import url from 'url';
import { includes, isArray, reduce } from 'lodash';

import { LOCAL_HOSTNAMES, REPLACEMENT_MAPPING } from '../consts';

export const applyReplacements = function(exampleCompilerCommand) {
  return reduce(REPLACEMENT_MAPPING, function(command, { replacement, replaceable }) {
    return command.replace(replaceable, replacement);
  }, exampleCompilerCommand)
};

export const containsSuccessMessage = function(stdout) {
  return stdout.indexOf('webpack: bundle is now VALID') > -1 ||
         stdout.indexOf('webpack: Compiled successfully') > -1;
};

export const getOutputUrl = function(stdout) {
  const URL_MATCH_PATTERN = /https?:\/\/[-a-zA-Z0-9@:%._+~#=]{2,256}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi;
  const urlMatch = URL_MATCH_PATTERN.exec(stdout);
  if (!isArray(urlMatch)) return null;

  const address = url.parse(urlMatch[0]);
  if (!includes(LOCAL_HOSTNAMES, address.hostname)) return null;

  return urlMatch[0];
};
