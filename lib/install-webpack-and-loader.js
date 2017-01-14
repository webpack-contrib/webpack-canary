var exec = require('child_process').exec;

module.exports = function(webpackSetup, loaderSetup, callback) {
  var installCommand = 'npm install ' + webpackSetup //+ ' ' + loaderSetup;

  exec(installCommand, function (err, stdout, stderr) {
    if (err) {
      callback(new Error('Error calling install command', err));
    }

    if (stderr) {
      callback(new Error('Error output when installing', stderr));
    }

    if (stdout.indexOf(webpackSetup.toString()) === -1 ||
        stdout.indexOf(loaderSetup.toString()) === -1) {
      // callback(new Error('Expected versions not displayed in dependency tree', stdout));
    }

    callback();
  });
};
