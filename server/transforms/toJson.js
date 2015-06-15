
var moment = require('moment');

module.exports = function (data) {
	try {
		return JSON.parse(data);
	} catch (err) {
		return {};
	}
}
