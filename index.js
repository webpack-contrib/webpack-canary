require("babel-register");

var getLogger = require('./lib/logger').default;
var argv = require('yargs').argv;
var loglevel = argv.loglevel || 'info';
var logger = getLogger(loglevel);
var options = { loglevel: loglevel };

require('./lib').default(argv.webpack, argv.dependency, options, function(err) {
  if (err) {
    logger.error('Errors have occurred running examples');
    process.exit(1);
  }

  logger.success('All examples passed');
});
