
var url			= require('url');
var querystring = require('querystring');
var metrics		= require('next-metrics');

var tokenise = function(location) {
	if (!location) return {};

	var tokens = url.parse(location);
	tokens.querystring = (tokens.search) ? querystring.parse(tokens.search.slice(1)) : {};
	return tokens;
}

module.exports = function (event) {
	
	return new Promise((resolve, reject) => {
		
		if (!process.env.transform_url && !process.env.mocha) {
			resolve({});
		}

		metrics.count('pipeline.transforms.url.count', 1);

		var referrer = event.pluck('context.referrer') || event.headers().referer;
		var location = event.pluck('context.url') || event.headers().referer; // FIXME
		
		resolve({
			referrer: tokenise(referrer),
			location: tokenise(location)
		});
	
	});
}
