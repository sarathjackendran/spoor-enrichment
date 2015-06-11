'use strict';

var fetch = require('node-fetch');
var statsd = require('../lib/statsd');

module.exports = function (cookie) {
	return new Promise(function (resolve, reject) {

		if (!cookie) resolve({});

		var match = cookie.match(/FTSESSION=([^;]+)/i);
		var session = match ? match[1] : undefined;

		var user = {
			session: session
		};

		console.log('models/session-api', 'validating', session);

		if (!session) {
			statsd.increment('ingest.consumer.models.session-api.no-session', 1);
			resolve(user);
			return;
		};

		if (Math.random() > 0.2) {
			statsd.increment('ingest.consumer.models.session-api.throttle', 1);
			resolve(user);
			return;
		};

		statsd.increment('ingest.consumer.models.session-api.fetch.request', 1);

		fetch('https://sessionapi-glb.memb.ft.com/membership/sessions/' + session, {
			timeout: 2000,
			headers: { 'ft_api_key': process.env.SESSION_API_KEY }
		}).then(function (res) {
			console.log('models/session-api', res.status);
			statsd.increment('ingest.consumer.models.session-api.fetch.response.' + res.status, 1);
			return res.json();
		}).then(function (content) {
			console.log('models/session-api', JSON.stringify(content));
			user.uuid = content.uuid;
			resolve(user);
		})['catch'](function (err) {
			console.log('models/session-api', 'error', err);
			statsd.increment('ingest.consumer.models.session-api.error', 1);
			resolve(user); // FIXME - could/should be a reject
		});
	});
};