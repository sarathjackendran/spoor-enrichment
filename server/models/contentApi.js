
var url		= require('url');
var fetch	= require('node-fetch');

const isArticle = /([a-f0-9-]{36})/;

// 
module.exports = function (referrer) {
	return new Promise((resolve, reject) => {

		var r = (referrer) ? url.parse(referrer) : {};
		
		if (!r.pathname) resolve({});
	
		var article = isArticle.exec(r.pathname);
		
		console.log('models/content-api', 'fetching', r.pathname, !!article);
		
		if (!article) resolve({});
		if (Math.random() > 0.5) resolve({});	// FIXME allows us to scale up

		// FIXME - extract uuid from r.pathname
		console.log('models/content-api', 'fetching n', article[0]);

		fetch('http://api.ft.com/content/' + article[0], {
				timeout: 2000,
				headers: { 'x-api-key': process.env.CAPI_API_KEY }
			})
			.then((res) => {
				console.log('models/content-api', res.status);
				return res.json();
			})
			.then((content) => {
				resolve({
					uuid: article[0],
					title: content.title,
					publishedDate: content.publishedDate,
					age: (new Date() - new Date(content.publishedDate)) / 1000
				})
			})
			.catch((err) => {
				reject(err);
			})
		
	});
};

