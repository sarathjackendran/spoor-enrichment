
var url = require('url');
var querystring = require('querystring');

module.exports = function (event) {
	
	var location = event.pluck('context.url'); // FIXME url vs location 

	if (location) {
		var tokens = url.parse(location);
		tokens.querystring = querystring.parse(tokens.search);
		event.annotate('url', tokens);
	}

	return event;
}
