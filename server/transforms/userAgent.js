
var UAParser	= require('ua-parser-js');
var metrics		= require('next-metrics');

module.exports = function (event) {

	metrics.count('pipeline.transforms.userAgent.count', 1);

	var headers = event.headers();

	var ua = event.pluck('device.user_agent') || headers['user-agent'];
	if (!ua) return event;

	var parser = new UAParser();
	parser.setUA(ua);
	event.annotate('ua', parser.getResult());
	return event;
}
