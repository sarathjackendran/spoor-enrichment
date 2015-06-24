
var UAParser	= require('ua-parser-js');

module.exports = function (event) {
	
	var headers = event.headers();
	
	if (!headers['user-agent']) return event;
	
	var parser = new UAParser();
	parser.setUA(headers['user-agent']);
	event.annotate('ua', parser.getResult());
	return event;
}
