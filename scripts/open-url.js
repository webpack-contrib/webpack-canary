/* global phantom */
const [, url] = require('system').args; /* eslint import/no-extraneous-dependencies:0, import/no-unresolved: 0 */
const { create } = require('webpage');

create()
  .open(url, () => { phantom.exit(); });
