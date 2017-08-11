import path from 'path';

/** @const {String} ROOT_PATH - Path where the test modules will be installed */
export const ROOT_PATH = path.join(__dirname, '..', 'test_modules');

/** @const {String} MODULES - Path where webpack and dependency will be saved */
export const MODULES = path.join(ROOT_PATH, 'node_modules');

/** @const {String} WEBPACK_BIN - Path to the Webpack binary fine */
export const WEBPACK_BIN = path.join(MODULES, 'webpack/bin/webpack.js');

/** @const {String} WEBPACK_CONFIG_FILENAME - The Webpack config file filename */
export const WEBPACK_CONFIG_FILENAME = 'webpack.config.js';

/** @const {Array} EXAMPLE_DIRECTORIES - Folders that will be checked for examples */
export const EXAMPLE_DIRECTORIES = ['examples', 'example'];

/** @const {Array} LOCAL_HOSTNAMES - A list of local hostnames */
export const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1'];

/** @const {RegEx} COMMAND_MATCH_PATTERN - Regex for matching commands from readme */
export const COMMAND_MATCH_PATTERN = /```([\s\S]+?)```/;

/** @const {Object} REPLACEMENT_MAPPING - Mappings for command replacements */
export const REPLACEMENT_MAPPING = [
  { replaceable: 'node ', replacement: 'node --no-warnings ' },
  { replaceable: '<insert local ip>', replacement: '127.0.0.1' },
  { replaceable: /^webpack-dev-server$/, replacement: 'node ../bin/webpack-dev-server.js' },
];

/** @const {Object} PHANTOMJS_OPTIONS - PhantomJS options */
export const PHANTOMJS_OPTIONS = {
  env: {
    QT_QPA_PLATFORM: 'offscreen',
  },
  timeout: 2000,
};
