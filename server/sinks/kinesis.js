
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

	if (!process.env.sink_kinesis) {
		console.log('sinks/kinesis', 'Kinesis sink is turned off');
		return;
	} 
	
	console.log('sinks/kinesis', 'writing message to Kinesis');
	metrics.count('sinks.kinesis.count', 1);

	// write to kinesis
	kinesis.putRecord({
		StreamName: 'spoor-egest-v3',
		PartitionKey: Math.random().toString(), // https://forums.aws.amazon.com/thread.jspa?threadID=173506
		Data: JSON.stringify(message)
	}, function(err, data) {
		if (err) { 
			console.log('sinks/kinesis', err);
			metrics.count('sinks.kinesis.error', 1);
		} else {
			console.log('sinks/kinesis', data);
			metrics.count('sinks.kinesis.ok', 1);
		}
	});

};
