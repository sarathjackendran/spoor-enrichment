
var fetch	= require('node-fetch');
//var statsd	= require('../lib/statsd');

require('es6-promise').polyfill();

module.exports = function (event) {
	
	return new Promise(function(resolve, reject) {

		var cookie = event.headers().cookie;

		if (!cookie) resolve({ });

		var match = cookie.match(/FTSESSION=([^;]+)/i);
		var session = (match) ? match[1] : undefined;
		
		var user = {
			sessionToken: session
		};

		//console.log('transforms/session-api', 'validating', session);
	
		if (!session) {
			resolve(user);
		};
		
		//statsd.increment('ingest.consumer.transforms.session-api.fetch.request', 1);

		fetch('https://sessionapi-glb.memb.ft.com/membership/sessions/' + session, {
				timeout: 2000,
				headers: { 'ft_api_key': process.env.SESSION_API_KEY }
			})
			.then((res) => {
				console.log('transforms/session-api', 'status', res.status);
				//statsd.increment('ingest.consumer.transforms.session-api.fetch.response.' + res.status, 1);
				return res.json();
			})
			.then((content) => {
				console.log('transforms/session-api', 'response', JSON.stringify(content));
				console.log('transforms/session-api', 'uuid', content.uuid, user);
				user.uuid = content.uuid;
				resolve(user);
			})
			.catch((err) => {
				console.log('transforms/session-api', 'error', err);
				//statsd.increment('ingest.consumer.transforms.session-api.error', 1);
				resolve(user);	// FIXME - could/should be a reject
			})
	});
}
