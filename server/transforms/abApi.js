
var url		= require('url');
var fetch	= require('node-fetch');
var metrics = require('next-metrics');

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
		metrics.count('pipeline.transforms.abApi.missing_ab_header', 1);
	}
};

module.exports = function (event) {
		
	if (!process.env.transform_ab) {
		console.log('transforms/ab-api', 'is switched off');
		return Promise.resolve({});
	}

	metrics.count('pipeline.transforms.abApi.count', 1);
	
	var cookie = event.headers().cookie;

	if (!cookie) {
		return Promise.resolve({});
	}

	var match = cookie.match(/FTSESSION=([^;]+)/i);
	var session = (match) ? match[1] : undefined;
	
	if (!session) {
		return Promise.resolve({});
	};
		
	console.log('models/ab-api', 'fetching', session);
	metrics.count('pipeline.transforms.abApi.fetch.request', 1);

	return fetch('https://ft-next-ab.herokuapp.com/spoor', {
			timeout: 2000,
			headers: {
				'ft-session-token' : session
			}
		})
		.then(res => {
			console.log('models/ab-api', session, res.status, res.headers.get('x-ft-ab'));
			metrics.count('pipeline.transforms.abApi.fetch.response.' + res.status, 1);
			if (res.status !== 200) {
				console.log('models/ab-api', 'status was not a 200', res.status);
				return { } 
			}
			var tokens = abSegments(res);
			console.log('models/ab-api', session, JSON.stringify(tokens));
			return tokens;
		})
		.catch((err) => {
			console.log('models/ab-api', 'error', err);
			metrics.count('pipeline.transforms.abApi.error', 1);
			return {};
		})
};

