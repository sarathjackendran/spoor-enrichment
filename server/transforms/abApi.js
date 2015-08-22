
var url		= require('url');
var fetch	= require('node-fetch');
var metrics = require('next-metrics');

var abSegments = ab => {
	console.log('transforms/ab-api', ab.headers.get('x-ft-ab'));
	if (ab && ab.headers && ab.headers.get('x-ft-ab') && ab.headers.get('x-ft-ab') !== '-') {
		var tests = ab.headers.get('x-ft-ab').split(',');
		var segments = {};
		tests.forEach(function (test) {
			var tokens = test.split(':');
			segments[tokens[0]] = tokens[1];
		});
		return segments;
	} else {
		metrics.count('pipeline.transforms.abApi.missing_ab_header', 1);
		return { };
	}
};

module.exports = function (event) {

	if (!process.env.transform_ab && !process.env.mocha) {
		console.log('transforms/ab-api', 'is switched off');
		return Promise.resolve({});
	}

	metrics.count('pipeline.transforms.abApi.count', 1);
	
	var cookie = event.headers().cookie || '';
	
	// signed in users will have a ft session token
	var hasSession = cookie.match(/FTSESSION=([^;]+)/i);
	var session = (hasSession) ? hasSession[1] : undefined;
	
	// anonymous users will have a ft allocation id - ref: https://github.com/Financial-Times/next-ab
	var hasAllocation = cookie.match(/ft-allocation-id=([^;]+)/i);
	var allocation = (hasAllocation) ? hasAllocation[1] : undefined;
	
	console.log('transforms/ab-api', 'fetching', session);
	metrics.count('pipeline.transforms.abApi.fetch.request', 1);

	return fetch('https://ft-next-ab.herokuapp.com/spoor', {
			timeout: 2000,
			headers: {
				'ft-session-token' : session,
				'ft-allocation-id' : allocation
			}
		})
		.then(res => {
			console.log('transforms/ab-api', session, res.status, res.headers.get('x-ft-ab'));
			metrics.count('pipeline.transforms.abApi.fetch.response.' + res.status, 1);
			if (res.status !== 200) {
				console.log('transforms/ab-api', 'status was not a 200', res.status);
				return { } 
			}
			var tokens = abSegments(res);
			console.log('transforms/ab-api', session, JSON.stringify(tokens));
			return tokens;
		})
		.catch((err) => {
			console.log('transforms/ab-api', 'error', err);
			metrics.count('pipeline.transforms.abApi.error', 1);
			return {};
		})
};

