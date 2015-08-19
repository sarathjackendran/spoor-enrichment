
var UAParser	= require('ua-parser-js');
var metrics		= require('next-metrics');
var fetch		= require('node-fetch');

module.exports = function (event) {

	if (!process.env.transform_device_atlas && !process.env.mocha) {
		Promise.resolve({});
	}

	metrics.count('pipeline.transforms.device-atlas.count', 1);

	var headers = event.headers();

	var ua = event.pluck('device.user_agent') || headers['user-agent'];

	if (!ua) {
		Promise.resolve({});
	}

	console.log('models/device-atlas', 'fetching', ua);

	metrics.count('pipeline.transforms.device-atlas.fetch.request', 1);

	return fetch('http://device-atlas', {	// FIXME - device atlas API call
			timeout: 2000
		})
		.then(response => Promise.all([Promise.resolve(response.status), response.json()]))
		.then(response => {

			var [status, res] = response;

			console.log('models/device-atlas', ua, status);

			metrics.count('pipeline.transforms.device-atlas.fetch.response.' + status, 1);
			
			if (status !== 200) {	// TODO - split device atlas responses in to unknown ua, known etc.
				return { };
			}
				
			return {
				// TODO	- either pluck out the events from device atlas, or copy the whole response
			};
		})
		.catch((err) => {
			console.log('models/device-atlas', ua, 'error', err);
			metrics.count('pipeline.transforms.device-atlas.error', 1);
			return { };
		})

}
