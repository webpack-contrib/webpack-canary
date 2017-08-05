import url from 'url';
import { includes, isArray, reduce } from 'lodash';

import { LOCAL_HOSTNAMES, REPLACEMENT_MAPPING } from '../consts';

/**
 * Process the compiler command from the example readme
 *
 * @param {String} exampleCompilerCommand - Example compiler command
 * @returns {String} Processed compiler command
 */
export const applyReplacements = function(exampleCompilerCommand) {
  return reduce(REPLACEMENT_MAPPING, (command, { replacement, replaceable }) => (
    command.replace(replaceable, replacement)
  ), exampleCompilerCommand)
};

/**
 * Determines if the childProcess.exec output indicates success
 *
 * @param {String} stdout - Process output
 * @returns {Boolean} Success message
 */
export const containsSuccessMessage = function(stdout) {
  return stdout.indexOf('webpack: bundle is now VALID') > -1 ||
         stdout.indexOf('webpack: Compiled successfully') > -1;
};

/**
 * Find an URL from childProcess.exec output
 *
 * @param {String} stdout - Process output
 * @returns {String} Found URL
 */
export const getOutputUrl = function(stdout) {
  const URL_MATCH_PATTERN = /https?:\/\/[-a-zA-Z0-9@:%._+~#=]{2,256}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi;
  const urlMatch = URL_MATCH_PATTERN.exec(stdout);
  if (!isArray(urlMatch)) {
    return null;
  }

  const address = url.parse(urlMatch[0]);
  if (!includes(LOCAL_HOSTNAMES, address.hostname)) {
    return null;
  }

  return urlMatch[0];
};
