
var AWS				= require('aws-sdk'); 
var moment			= require('moment');
var metrics			= require('next-metrics')
var	debug			= require('debug')('kinesis-sink');

AWS.config.update({
	accessKeyId: process.env.accessKey, 
	secretAccessKey: process.env.secretAccessKey, 
	"region": "eu-west-1"
});

var kinesis = new AWS.Kinesis();

module.exports = function (message) {

	if (!process.env.sink_kinesis) {
		debug('Kinesis sink is turned off');
		return;
	} 
	
	debug('%s Writing event to Kinesis', message.ingest._headers['x-request-id']);
	metrics.count('sinks.kinesis.count', 1);

	// write to kinesis
	kinesis.putRecord({
		StreamName: 'spoor-egest-v3',
		PartitionKey: Math.random().toString(), // https://forums.aws.amazon.com/thread.jspa?threadID=173506
		Data: JSON.stringify(message)
	}, function(err, data) {
		if (err) { 
			debug('%s Event NOT written to Kinesis: %s', message.ingest._headers['x-request-id'], err);
			metrics.count('sinks.kinesis.error', 1);
		} else {
			debug('%s Event written to Kinesis', message.ingest._headers['x-request-id']);
			metrics.count('sinks.kinesis.ok', 1);
		}
	});

};
