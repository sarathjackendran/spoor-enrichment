
var url		= require('url');
var fetch	= require('node-fetch');
var statsd	= require('../lib/statsd');

const isArticle = /([a-f0-9-]{36})/;

// 
module.exports = function (event) {
	return new Promise((resolve, reject) => {

		var uuid = event.pluck('context.content.id');

		if (!uuid) {
		
			var r = (event.headers().referer) ? url.parse(event.headers().referer) : {};
		
			if (!r.pathname) {
				resolve({});
			}
		
			var article = isArticle.exec(r.pathname);
			
			if (!article) {
				resolve({})
			};

			uuid = article[0];
		}

		console.log('models/content-api', 'fetching', uuid);

		statsd.increment('ingest.consumer.models.content-api.fetch.request', 1);

		fetch('http://api.ft.com/content/' + uuid, {
				timeout: 2000,
				headers: { 'x-api-key': process.env.CAPI_API_KEY }
			})
			.then(res => {
				
				console.log('models/content-api', uuid, res.status);
				statsd.increment('ingest.consumer.models.content-api.fetch.response.' + res.status, 1);
				
				if (res.status !== 200) {
					resolve({});
				}
				
				return res.json();
			})
			.then(content => {
				console.log('models/content-api', article[0], content.title);
				resolve({
					uuid: article[0],
					title: content.title,
					publishedDate: content.publishedDate,
					age: (new Date() - new Date(content.publishedDate)) / 1000
				})
			})
			.catch((err) => {
				console.log('models/content-api', article[0], 'error', err);
				statsd.increment('ingest.consumer.models.content-api.error', 1);
				resolve({});	// FIXME - could/should be a reject
			})
		
	});
};

