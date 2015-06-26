
var url		= require('url');
var fetch	= require('node-fetch');
var statsd	= require('../lib/statsd');

const isArticle = /([a-f0-9-]{36})/;

// 
module.exports = function (event) {
	return new Promise((resolve, reject) => {

		// FIXME - extract `event.body.context.article.uuid`
		var r = (event.headers().referrer) ? url.parse(event.headers().referrer) : {};
		
		if (!r.pathname) resolve({});
	
		var article = isArticle.exec(r.pathname);
		
		console.log('models/content-api', 'fetching', r.pathname, !!article);
		
		if (!article) resolve({});

		// FIXME - extract uuid from r.pathname
		console.log('models/content-api', 'fetching n', article[0]);

		statsd.increment('ingest.consumer.models.content-api.fetch.request', 1);

		fetch('http://api.ft.com/content/' + article[0], {
				timeout: 2000,
				headers: { 'x-api-key': process.env.CAPI_API_KEY }
			})
			.then((res) => {
				console.log('models/content-api', article[0], res.status);
				statsd.increment('ingest.consumer.models.content-api.fetch.response.' + res.status, 1);
				return res.json();
			})
			.then((content) => {
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

