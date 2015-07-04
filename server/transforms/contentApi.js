
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
	
	if (!process.env.transform_capi) {
		console.log('transforms/content-api', 'is switched off');
		return Promise.resolve({});
	}

	metrics.count('pipeline.transforms.contentApi.count', 1);

	var uuid = event.pluck('context.content.uuid');

	if (!uuid) {
		uuid = pluckUuidFromHeaders(event);
	}
	
	if (!uuid) {
		return Promise.resolve({});
	}

	console.log('models/content-api', 'fetching', uuid);

	metrics.count('pipeline.transforms.contentApi.fetch.request', 1);

	return fetch('http://api.ft.com/content/' + uuid, {
				timeout: 2000,
				headers: {
					'x-api-key': process.env.CAPI_API_KEY
				}
		})
		.then(res => {
			console.log('models/content-api', uuid, res.status);
			metrics.count('pipeline.transforms.contentApi.fetch.response.' + res.status, 1);
			if (res.status !== 200) {
				console.log('models/content-api', 'status was not a 200', res.status);
				return { }
			} else {
				return res.json()
					.then(content => {
						return {
							uuid: uuid,
							title: content.title,
							publishedDate: content.publishedDate,
							age: (new Date() - new Date(content.publishedDate)) / 1000
						};
					})
			}
		})
		.catch((err) => {
			console.log('models/content-api', uuid, 'error', err);
			metrics.count('pipeline.transforms.contentApi.error', 1);
			return {};
		})

};
