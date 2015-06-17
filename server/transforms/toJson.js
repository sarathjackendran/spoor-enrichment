
var moment = require('moment');

module.exports = function (data) {
	try {
	
		data.ingest.BodyAsJson = JSON.parse(data.ingest.Body);
		
		var message = new Buffer(data.ingest.BodyAsJson.message).toString('utf8');
		data.ingest.message = JSON.parse(message);

		return data;
	} catch (err) {
		console.log('ERROR', err);
		return {};
	}
}
