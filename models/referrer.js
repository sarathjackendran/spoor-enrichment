
var url = require('url');

module.exports = function (referrer) {
	return new Promise(function(resolve, reject) {
		resolve({
			referrer: url.parse(referrer) 
		});
	});
}
