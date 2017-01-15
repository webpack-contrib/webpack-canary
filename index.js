require("babel-register");

var argv = require('yargs').argv;
require('./lib').default(argv.webpack, argv.dependency);
