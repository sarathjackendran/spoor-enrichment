
var fetch	= require('node-fetch');
var statsd	= require('../lib/statsd');

require('es6-promise').polyfill();

module.exports = function (data) {

	var cookie = data.ingest.BodyAsJson.envelope.headers.cookie;
	
	return new Promise(function(resolve, reject) {

		if (!cookie) resolve({});

		var match = cookie.match(/FTSESSION=([^;]+)/i);
		var session = (match) ? match[1] : undefined;
		
		var user = {
			token: session
		};

		console.log('transforms/session-api', 'validating', session);
	
		if (!session) {
			return;
		};

		if (false) { // FIXME allows us to thottle the requests
			statsd.increment('ingest.consumer.transforms.session-api.throttle', 1);
			resolve(user);
			return;
		};
		
		statsd.increment('ingest.consumer.transforms.session-api.fetch.request', 1);

		fetch('https://sessionapi-glb.memb.ft.com/membership/sessions/' + session, {
				timeout: 2000,
				headers: { 'ft_api_key': process.env.SESSION_API_KEY }
			})
			.then((res) => {
				console.log('transforms/session-api', 'status', res.status);
				statsd.increment('ingest.consumer.transforms.session-api.fetch.response.' + res.status, 1);
				return res.json();
			})
			.then((content) => {
				console.log('transforms/session-api', 'response', JSON.stringify(content));
				user.uuid = content.uuid;
				resolve(user);
			})
			.catch((err) => {
				console.log('transforms/session-api', 'error', err);
				statsd.increment('ingest.consumer.transforms.session-api.error', 1);
				resolve(user);	// FIXME - could/should be a reject
			})
	});
}
