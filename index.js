require("babel-register");

var getLogger = require('./lib/logger').default;
var argv = require('yargs').argv;
var logLevel = argv.logLevel || 'info';
var logger = getLogger(logLevel);
var options = { logLevel: logLevel };

require('./lib').default(argv.webpack, argv.dependency, options, function(err) {
  if (err) {
    logger.error(err);
    process.exit(1);
  }

  logger.success('All examples passed');
});
