
var url			= require('url');
var querystring = require('querystring');
var metrics		= require('next-metrics');

module.exports = function (event) {
	
	metrics.count('pipeline.transforms.referer.count', 1);
	
	var location = event.pluck('context.referrer') || ''; 
	
	if (location) {
		var tokens = url.parse(location);
		tokens.querystring = (tokens.search) ? querystring.parse(tokens.search.slice(1)) : {};
		event.annotate('referrer', tokens);
	} else {
		event.annotate('referrer', {});
	}

	return event;
}
