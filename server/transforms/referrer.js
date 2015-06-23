
var url = require('url');

module.exports = function (referrer) {
	var r = (referrer) ? url.parse(referrer) : {};
}
