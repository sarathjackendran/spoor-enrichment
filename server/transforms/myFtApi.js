
var fetch	= require('node-fetch');
var metrics = require('next-metrics');

module.exports = (event) => {
	
	if (!process.env.transform_myft && !process.env.mocha) {
		console.log('transforms/myft-api', 'is switched off');
		return Promise.resolve({});
	}

	var hasUuid = event.annotations().user && event.annotations().user.uuid;

	if (!hasUuid) {
		return Promise.resolve({});
	}

	if (event.annotations().url && event.annotations().url.hostname !== 'next.ft.com') {
		return Promise.resolve({});
	}

	var uuid = event.annotations().user.uuid;

	metrics.count('pipeline.transforms.myft-api.count', 1);
	
	console.log('transforms/myft-api', 'fetching', hasUuid, event.annotations().user.uuid, event.annotations().url.hostname);

	metrics.count('pipeline.transforms.myft-api.fetch.request', 1);
	
	return fetch('https://next.ft.com/__user-prefs/beacon/User:guid-' + uuid, {
				headers: {
					'x-api-key': process.env.MYFT_API_KEY
				}
			}).then(response => {
				console.log('transforms/myft-api', uuid, res.status);
				metrics.count('pipeline.transforms.myft-api.fetch.response.' + res.status, 1);
				return response.json()
			}).then(myft => {
				
				if (res.status !== 200) {
					console.log('transforms/myft-api', 'status was not a 200', res.status);
					return { }
				} else {

					var preferences = {};
					myft.preferences.Items.forEach(function (pref) {
						if (pref.Owner.S.indexOf('User:') >= 0) {
							preferences[pref.Relationship.S.split(':').pop()] = true;
						}
					});
					
					var streamRegex = /^stream\/([a-z]+Id)\/(.*)/;
					var isEngagedTopic = false;
					if(typeof myft.userHistory !== 'undefined' && streamRegex.test(uuid)) {
						var slugs = uuid.match(streamRegex);
						var id = slugs[1] + ':"' + slugs[2] + '"';

						var isEngaged = myft.userHistory.Items.some(function(topic) {
							return topic.id === id && topic.count > 3;
						});

						if(isEngaged) {
							isEngagedTopic = true;
						}
					};

					return {
						following: myft.following.Count,
						preferences: preferences,
						isEngagedTopic: isEngagedTopic 
					}
				}
			})
			.catch((err) => {
				console.log('transforms/myft-api', uuid, 'error', err);
				metrics.count('pipeline.transforms.myft-api.error', 1);
				return {};
			});
}
