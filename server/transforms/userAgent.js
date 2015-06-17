
var UAParser	= require('ua-parser-js');
var moment		= require('moment');

var moment = require('moment');

module.exports = function (data) {
	
	// FIXME - sort out a safe read - Eg. new Message({ ... }).get('ingest.cookie');
	try {
		var uaString = data.ingest.BodyAsJson.envelope.headers['user-agent'];
	} catch (e) { 
		console.log('FIXME!!!');
		return data;
	}

	var parser = new UAParser();
	parser.setUA(uaString);
	data.egest.user.ua = parser.getResult();
	return data;
}
