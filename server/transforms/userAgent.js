
var UAParser	= require('ua-parser-js');
var metrics		= require('next-metrics');

module.exports = function (event) {

	return new Promise((resolve, reject) => {
		
		if (!process.env.transform_ua) {
			resolve({});
		}
	
		metrics.count('pipeline.transforms.userAgent.count', 1);

		var headers = event.headers();

		var ua = event.pluck('device.user_agent') || headers['user-agent'];
		if (!ua) {
			resolve({});
		}

		var parser = new UAParser();
		parser.setUA(ua);
		
		resolve(parser.getResult());
	});

}
