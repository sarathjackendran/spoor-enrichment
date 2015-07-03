
var fetch	= require('node-fetch');
var metrics = require('next-metrics');

require('es6-promise').polyfill();

module.exports = function (event) {
	
	return new Promise(function(resolve, reject) {

		metrics.count('pipeline.transforms.sessionApi.count', 1);
		
		var cookie = event.headers().cookie;

		if (!cookie) resolve({ });

		var match = cookie.match(/FTSESSION=([^;]+)/i);
		var session = (match) ? match[1] : undefined;
		
		var user = {
			sessionToken: session
		};

		if (!session) {
			resolve(user);
		};
		
		console.log('transforms/session-api', 'session', session);
		
		metrics.count('pipeline.transforms.sessionApi.fetch.request', 1);

		fetch('https://sessionapi-glb.memb.ft.com/membership/sessions/' + session, {
				timeout: 2000,
				headers: { 'ft_api_key': process.env.SESSION_API_KEY }
			})
			.then((res) => {
				console.log('transforms/session-api', 'status', res.status);
				metrics.count('pipeline.transforms.sessionApi.fetch.response.' + res.status, 1);
				
				if (res.status === 200) {
					return res.json();
				} else {
					return { }
				}
			})
			.then((content) => {
				console.log('transforms/session-api', 'response', JSON.stringify(content));
				console.log('transforms/session-api', 'uuid', content.uuid, user);
				user.uuid = content.uuid;
				resolve(user);
			})
			.catch((err) => {
				console.log('transforms/session-api', 'error', err);
				metrics.count('pipeline.transforms.sessionApi.error', 1);
				resolve(user);	// FIXME - could/should be a reject
			})
	});
}
