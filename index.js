require("babel-register");
var logger = require('./lib/logger').default;

var fatalError = function(err) {
  logger.error(err);
  process.exit(1);
};

var argv = require('yargs').argv;
require('./lib').default(argv.webpack, argv.dependency, function(err) {
  if (err) {
    fatalError(err);
  } else {
    logger.success('All examples passed');
  }
});
