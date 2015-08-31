var readline = require('readline');
var fs = require('fs');
var referrersFilePath = '.././docs/classifications.txt';
module.exports = function (event) {
	return new Promise((resolve, reject) => {
    var referrer = event.pluck('context.referrer') || event.headers().referer;
		var obj ={};
		var result = new Array();
		fs.stat(referrersFilePath, function(err, stat) {
		    if(err == null) {
						var rd = readline.createInterface({
							input: fs.createReadStream(referrersFilePath),
							output: process.stdout,
							terminal: false
						});
					rd.on('line', function(line) {
						result = line.split(',');
						obj[result[0]] = (result[1]);
					});
					rd.on('close', function() {
						resolve ({
							referrerType: (obj[referrer]) ? obj[referrer] : 'Direct'
						});
					});
		    } else {
		        console.log('Referrer file could not be read');
		    }
		});

	});
};
