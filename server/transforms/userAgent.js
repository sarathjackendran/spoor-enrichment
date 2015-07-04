
var UAParser	= require('ua-parser-js');
var metrics		= require('next-metrics');

module.exports = function (event) {
	
	metrics.count('pipeline.transforms.userAgent.count', 1);
	
	var headers = event.headers();
	
	if (!headers['user-agent']) return event;
	
	var parser = new UAParser();
	parser.setUA(headers['user-agent']);
	event.annotate('ua', parser.getResult());
	return event;
}
