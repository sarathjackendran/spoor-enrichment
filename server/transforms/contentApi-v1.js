
var url		= require('url');
var fetch	= require('node-fetch');
var metrics = require('next-metrics');

const isArticle = /([a-f0-9-]{36})/;

var pluckUuidFromHeaders = function (event) {
	var r = (event.headers().referer) ? url.parse(event.headers().referer) : {};
	if (!r.pathname) {
		return false;
	}
	var article = isArticle.exec(r.pathname);
	if (!article) {
		return false;
	};
	return article[0];
}

// 
module.exports = function (event) {
	
	if (!process.env.transform_capi_v1) {
		console.log('transforms/content-api-v1', 'is switched off');
		return Promise.resolve({});
	}

	metrics.count('pipeline.transforms.contentApi_v1.count', 1);

	var uuid = event.pluck('context.content.uuid');

	if (!uuid) {
		uuid = pluckUuidFromHeaders(event);
	}
	
	if (!uuid) {
		return Promise.resolve({});
	}

	console.log('transforms/content-api-v1', 'fetching', uuid);

	metrics.count('pipeline.transforms.contentApi_v1.fetch.request', 1);

	// http://api.ft.com/content/items/v1/54ea0c0a-0ae1-11e5-9df4-00144feabdc0
	return fetch('http://api.ft.com/content/items/v1/' + uuid, {
				timeout: 2000,
				headers: {
					'x-api-key': process.env.CAPI_API_KEY
				}
		})
		.then(res => {
			console.log('transforms/content-api-v1', uuid, res.status);
			metrics.count('pipeline.transforms.contentApi_v1.fetch.response.' + res.status, 1);
			if (res.status !== 200) {
				console.log('transforms/content-api-v1', 'status was not a 200', res.status);
				return { }
			} else {
				return res.json()
					.then(content => {
						return {
							classification: content.item.location.uri
						};
					})
			}
		})
		.catch((err) => {
			console.log('transforms/content-api-v1', uuid, 'error', err);
			metrics.count('pipeline.transforms.contentApi_v1.error', 1);
			return {};
		})

};
