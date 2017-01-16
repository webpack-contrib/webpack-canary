export default function(config, callback) {
  const webpack = require('webpack');
  const compiler = webpack(config);

  compiler.run(function(err, stats) {
    if (err) {
      callback(['Error running webpack', err]);
      return;
    }

    const jsonStats = stats.toJson();

    if (jsonStats.errors.length > 0) {
      callback(['Errors output during compilation', jsonStats.errors]);
      return;
    }

    if (jsonStats.warnings.length > 0) {
      callback(['Warnings output during compilation', jsonStats.warnings]);
      return;
    }

    callback();
  });
}
