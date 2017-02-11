var url = require('system').args[1];
require('webpage').create().open(url, function () { phantom.exit(); });
