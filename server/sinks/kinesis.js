
var AWS				= require('aws-sdk'); 
var moment			= require('moment');
var metrics			= require('next-metrics')

AWS.config.update({
	accessKeyId: process.env.accessKey, 
	secretAccessKey: process.env.secretAccessKey, 
	"region": "eu-west-1"
});

var kinesis = new AWS.Kinesis();

module.exports = function (message) {
	
	console.log('sinks/kinesis', 'writing message to Kinesis');
	metrics.count('sinks.kinesis.count', 1);

	// write to kinesis
	kinesis.putRecord({
		StreamName: 'spoor-egest-v2',
		PartitionKey: "event",
		Data: message
	}, function(err, data) {
		if (err) { 
			console.log('sinks/kinesis', err);
			metrics.count('sinks.kinesis.error', 1);
		} else {
			console.log(data);
			metrics.count('sinks.kinesis.ok', 1);
		}
	});

};
