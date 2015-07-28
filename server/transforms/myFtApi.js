
var fetch	= require('node-fetch');
var metrics = require('next-metrics');

module.exports = (event) => {
	
	if (!process.env.transform_myft && !process.env.mocha) {
		console.log('transforms/myft-api', 'is switched off');
		return Promise.resolve({});
	}

	var hasUuid = event.annotations().user && event.annotations().user.uuid;

	if (!hasUuid) {
		return false;
	}

	var uuid = event.annotations().user.uuid;

	metrics.count('pipeline.transforms.myft-api.count', 1);
	
	// FIXME Check if this is a next.ft.com request 
	
	console.log('transforms/myft-api', 'fetching', uuid);

	metrics.count('pipeline.transforms.myft-api.fetch.request', 1);
	
	return fetch('https://next.ft.com/__user-prefs/beacon/User:guid-' + uuid, {
				headers: {
					'x-api-key': process.env.USER_PREFS_API_KEY
				}
			}).then(response => {
				return response.json()
			}).then(myft => {

				var preferences = {};
				myft.preferences.Items.forEach(function (pref) {
					if (pref.Owner.S.indexOf('User:') >= 0) {
						preferences[pref.Relationship.S.split(':').pop()] = true;
					}
				});
				
				var streamRegex = /^stream\/([a-z]+Id)\/(.*)/;
				var isEngagedTopic = false;
				if(typeof userHistory !== 'undefined' && streamRegex.test(uuid)) {
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
					following: {
						count: myft.following.Count
					},
					preferences: preferences,
					isEngagedTopic: isEngagedTopic 
				}
			})
			.catch((err) => {
				console.log('transforms/myft-api', uuid, 'error', err);
				metrics.count('pipeline.transforms.myft-api.error', 1);
				return {};
			});
}
