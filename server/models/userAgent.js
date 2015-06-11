
var UAParser	= require('ua-parser-js');
var moment		= require('moment');

module.exports = function (uaString) {
	
	var parser = new UAParser();
	parser.setUA(uaString);

	return new Promise(function(resolve, reject) {
		resolve({
			userAgent: parser.getResult()
		});
	});
}
