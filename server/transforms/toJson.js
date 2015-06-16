
var moment = require('moment');

module.exports = function (data) {
	try {
		data.ingest.BodyAsJson = JSON.parse(data.ingest.Body);
		return data;
	} catch (err) {
		console.log('ERROR', err);
		return {};
	}
}
