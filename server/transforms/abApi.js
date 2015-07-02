
var url		= require('url');
var fetch	= require('node-fetch');
var statsd	= require('../lib/statsd');

var abSegments = (ab) => {
	if (ab.headers.get('x-ft-ab')) {
		var tests = ab.headers.get('x-ft-ab').split(',');
		var abSegments = {};
		tests.forEach(function (test) {
			var tokens = test.split(':');
			abSegments[tokens[0]] = tokens[1];
		});
		return abSegments;
	} else {
		Metric.count('event_decoration.no_ab');
	}
};

module.exports = function (event) {
		
	return new Promise((resolve, reject) => {

		var cookie = event.headers().cookie;

		if (!cookie) {
			resolve({});
		}

		var match = cookie.match(/FTSESSION=([^;]+)/i);
		var session = (match) ? match[1] : undefined;
		
		if (!session) {
			resolve({});
		};
		
		console.log('models/ab-api', 'fetching', session);

		fetch('https://ft-next-ab.herokuapp.com/spoor', {
				timeout: 2000,
				headers: {
					'ft-session-token' : session
				}
			})
			.then(res => {
				console.log('models/ab-api', session, res.status, res.headers.get('x-ft-ab'));
				if (res.status !== 200) {
					resolve({});
				}
				var tokens = abSegments(res);
				console.log('models/ab-api', session, JSON.stringify(tokens));
				resolve(tokens);
			})
			.catch((err) => {
				console.log('models/ab-api', 'error', err);
				resolve({});	// FIXME - could/should be a reject
			})
		
	});
};

