'use strict';

var url = require('url');
var fetch = require('node-fetch');

var isArticle = /([a-f0-9-]{36})/;

//
module.exports = function (referrer) {
	return new Promise(function (resolve, reject) {

		var r = referrer ? url.parse(referrer) : {};

		if (!r.pathname) resolve({});

		var article = isArticle.exec(r.pathname);

		console.log('models/content-api', 'fetching', r.pathname, !!article);

		if (!article) resolve({});
		if (Math.random() > 0.2) resolve({}); // FIXME allows us to scale up

		// FIXME - extract uuid from r.pathname
		console.log('models/content-api', 'fetching n', article[0]);

		fetch('http://api.ft.com/content/' + article[0], {
			timeout: 2000,
			headers: { 'x-api-key': process.env.CAPI_API_KEY }
		}).then(function (res) {
			console.log('models/content-api', res.status);
			return res.json();
		}).then(function (content) {
			resolve({
				uuid: article[0],
				title: content.title,
				publishedDate: content.publishedDate,
				age: (new Date() - new Date(content.publishedDate)) / 1000
			});
		})['catch'](function (err) {
			reject(err);
		});
	});
};