
var url			= require('url');
var querystring = require('querystring');
var metrics		= require('next-metrics');

module.exports = function (event) {
	
	metrics.count('pipeline.transforms.url.count', 1);
	
	var location = event.pluck('context.url') || event.headers().referer;
	
	if (location) {
		var tokens = url.parse(location);
		tokens.querystring = (tokens.search) ? querystring.parse(tokens.search.slice(1)) : {};
		event.annotate('url', tokens);
	} else {
		event.annotate('url', {});
	}

	return event;
}
