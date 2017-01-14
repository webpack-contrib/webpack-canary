module.exports = function(config, callback) {
  var webpack = require('webpack');
  var compiler = webpack(config);

  compiler.run(function(err, stats) {
    if (err) {
      callback(new Error('Error running webpack', err));
    }

    var jsonStats = stats.toJson();
    if (jsonStats.errors.length > 0) {
      callback(new Error('Errors output during compilation', jsonStats.errors));
    }


    if (jsonStats.warnings.length > 0) {
      callback(new Error('Warnings output during compilation', jsonStats.warnings));
    }

    callback();
  });
};
