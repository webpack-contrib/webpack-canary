import path from 'path';

const parentPath = path.join(__dirname, '..');
const parsedPath = path.parse(parentPath);

/** @const {String} CANARY_ROOT - Different paths for runtime and buildtime root */
const CANARY_ROOT = parsedPath.name === 'dist' ? path.join(parentPath, '..') : parentPath;

/** @const {String} ROOT_PATH - Path where the test modules will be installed */
export const ROOT_PATH = path.join(CANARY_ROOT, 'test_modules');

/** @const {String} TEST_PATH - Path where the tests on the dependency module will be run */
export const TEST_PATH = path.join(ROOT_PATH, 'test-dependency');

/** @const {String} MODULES - Path where webpack and dependency will be saved */
export const MODULES = path.join(ROOT_PATH, 'node_modules');

/** @const {String} WEBPACK_BIN - Path to the Webpack binary fine */
export const WEBPACK_BIN = path.join(MODULES, 'webpack/bin/webpack.js');

/** @const {String} WEBPACK_CONFIG_FILENAME - The Webpack config file filename */
export const WEBPACK_CONFIG_FILENAME = 'webpack.config.js';

/** @const {String} CANARY_CONFIG_FILENAME - The default canary config filename */
export const CANARY_CONFIG_FILENAME = 'webpack-canary.config.js';

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

/** @const {Number} DEFAULT_EXEC_TIMEOUT - Default timeout for exec commands */
export const DEFAULT_EXEC_TIMEOUT = 60000;
