import path from 'path';

export const WEBPACK_CONFIG_FILENAME = 'webpack.config.js';
export const EXAMPLE_DIRECTORIES = ['examples', 'example'];
export const WEBPACK_BIN = './node_modules/webpack/bin/webpack.js';
export const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1'];

export const COMMAND_MATCH_PATTERN = /```([\s\S]+?)```/;

export const REPLACEMENT_MAPPING = [
  { replaceable: 'node ', replacement: 'node --no-warnings ' },
  { replaceable: '<insert local ip>', replacement: '127.0.0.1' },
  { replaceable: /^webpack-dev-server$/, replacement: 'node ../bin/webpack-dev-server.js' }
];

export const PHANTOMJS_OPTIONS = {
  env: {
    QT_QPA_PLATFORM: 'offscreen'
  },
  timeout: 2000
};

export const MODULES = path.join(__dirname, '..', 'node_modules');
