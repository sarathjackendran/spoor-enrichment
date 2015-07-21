
var url		= require('url');
var fetch	= require('node-fetch');
var metrics = require('next-metrics');
var cheerio	= require('cheerio');

const isArticle = /([a-f0-9-]{36})/;

var countWords = function (str) {
	return (str) ? str.split(' ').length : 0;
}

var url2classification = (url) => {
	var m = /cms\/s\/([\d]+)/.exec(url);
	return (m) ? m[1] : m;
}

var genreFromMetadata = (metadata) => {
	try {
		return metadata.genre[0].term.name;
	} catch (e) {
		return false;
	}
}

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
	
	if (!process.env.transform_capi_v1 && !process.env.mocha) {
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
						
						var $ = cheerio.load((content.item.body && content.item.body.body) || '');

						return {
							classification: url2classification(content.item.location.uri),
							uuid: content.item.id,
							metadata: content.item.metadata,
							title: content.item.title.title,
							publishedDate: content.item.lifecycle.initialPublishDateTime,
							age: (new Date() - new Date(content.item.lifecycle.initialPublishDateTime)) / 1000,
							wordCount: countWords(content.item.body.body),
							genre: genreFromMetadata(content.item.metadata),
							flags: {
								hasGallery: $('aside[data-asset-type="slideshow"]').length > 0,
								hasPromoBox: $('aside[data-asset-type="promoBox"]').length > 0,
								hasPullQuote: $('aside[data-asset-type="pullQuote"]').length > 0,
								hasTableOfContents: $('.ft-subhead .ft-bold').length > 2,
								hasLinksInBody: $('a').length > 0,
							}
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
