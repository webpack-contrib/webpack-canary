module.exports = {
  versions: {
    'v1.14.0': [{
      dependency: 'https://github.com/webpack/webpack-dev-server/archive/v1.16.3.tar.gz',
      exampleDir: 'example',
    }],
    'v2.2.1': [{
      dependency: 'https://github.com/webpack/webpack-dev-server/archive/v2.3.0.tar.gz',
      // exampleDir: 'examples',
      test: 'npm test',
    }],
    'webpack/webpack#master': [{
      dependency: 'https://github.com/webpack/webpack-dev-server/archive/master.tar.gz',
      exampleDir: 'examples',
      test: 'npm test',
      timeout: 180000,
      packageManager: 'npm',
    }],
  },
  loglevel: 'trace',
  packageManager: 'yarn',
};
