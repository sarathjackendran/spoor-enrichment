
var url = require('url');

module.exports = function (referrer) {
	return new Promise(function(resolve, reject) {
		var r = (referrer) ? url.parse(referrer) : {};
		resolve({
			referrer: r 
		});
	});
}
