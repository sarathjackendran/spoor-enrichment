
var AWS				= require('aws-sdk'); 
var moment			= require('moment');
var uuid			= require('node-uuid');
var statsd			= require('../lib/statsd');

AWS.config.update({
	accessKeyId: process.env.accessKey, 
	secretAccessKey: process.env.secretAccessKey, 
	"region": "eu-west-1"
});

var kinesis = new AWS.Kinesis();

module.exports = function (message) {
	
	console.log('Writing message to Kinesis');

	statsd.increment('kinesis.message.count', 1);

	// write to kinesis
	kinesis.putRecord({
		StreamName: 'spoor-ingest', PartitionKey: "event", Data: message.toString()
	}, function(err, data) {
		if (err) {
			statsd.increment('kinesis.message.error', 1);
		}
		else {
			statsd.increment('kinesis.message.success', 1);
		}

		console.log(err, data);
	});

};
