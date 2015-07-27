
var fetch	= require('node-fetch');
var metrics = require('next-metrics');

module.exports = (event) => {
	
	if (!process.env.transform_userprefs && !process.env.mocha) {
		console.log('transforms/user-prefs', 'is switched off');
		return Promise.resolve({});
	}

	var hasUuid = event.annotations().user && event.annotations().user.uuid;

	if (!hasUuid) {
		return false;
	}

	var uuid = event.annotations().user.uuid;

	metrics.count('pipeline.transforms.user-prefs.count', 1);
	
	// 1. Grab uuid
	// 2. Check if this is a next.ft.com request 
	
	console.log('transforms/user-prefs', 'fetching', uuid);

	metrics.count('pipeline.transforms.user-prefs.fetch.request', 1);
	
	return fetch('https://next.ft.com/__user-prefs/beacon/User:guid-' + uuid, {
			headers: {
				'x-api-key': process.env.USER_PREFS_API_KEY
			}
		}).then((response) =>  {
			return response.json()
		});
}
