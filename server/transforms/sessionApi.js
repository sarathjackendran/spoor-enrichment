
var fetch	= require('node-fetch');
var metrics = require('next-metrics');

module.exports = function (event) {

	if (!process.env.transform_session && !process.env.mocha) {
		console.log('transforms/session-api', 'is switched off');
		return Promise.resolve({});
	}

		metrics.count('pipeline.transforms.sessionApi.count', 1);

		var session = event.pluck('user.ft_session');
		if (!session) {
			var cookie = event.headers().cookie;

			if (!cookie) {
				return Promise.resolve({});
			}
			var match = cookie.match(/FTSESSION=([^;]+)/i);
			session = (match) ? match[1] : undefined;
		}
		if (!session) {
			return Promise.resolve({});
		};

		var user = {
			sessionToken: session
		};

		console.log('transforms/session-api', 'session', session);

		metrics.count('pipeline.transforms.sessionApi.fetch.request', 1);

		return fetch('https://sessionapi-glb.memb.ft.com/membership/sessions/' + session, {
				timeout: 2000,
				headers: {
					'ft_api_key': process.env.SESSION_API_KEY
				}
			})
			.then((res) => {
				console.log('transforms/session-api', 'status', res.status);
				metrics.count('pipeline.transforms.sessionApi.fetch.response.' + res.status, 1);

				if (res.status === 200) {
					return res.json();
				} else {
					return {};
				}
			})
			.then((content) => {
				console.log('transforms/session-api', 'response', JSON.stringify(content));
				console.log('transforms/session-api', 'uuid', content.uuid, user);
				
				if (!content && !content.uuid) {
					return {};
				}

				user.uuid = content.uuid;
				return user;
			})
			.catch((err) => {
				console.log('transforms/session-api', 'error', err);
				metrics.count('pipeline.transforms.sessionApi.error', 1);
				return user;
			})
}
