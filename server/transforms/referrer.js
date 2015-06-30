
var url = require('url');

module.exports = function (event) {
	var r = (event.headers().referer) ? url.parse(event.headers().referer) : {};
	event.annotate('referrer', r);
	return event;
}
