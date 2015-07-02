
var AWS				= require('aws-sdk'); 
var metrics			= require('next-metrics')

AWS.config.update({
	accessKeyId: process.env.accessKey, 
	secretAccessKey: process.env.secretAccessKey, 
	"region": "eu-west-1"
});

var sqs = new AWS.SQS();
var sqsUrlEgest = process.env.SQS_EGEST;

module.exports = function (message) {

	if (!process.env.sink_sqs) {
		console.log('sinks/sqs', 'SQS sink is turned off');
		return;
	} 

	console.log('sinks/sqs', 'writing message to SQS');
	
	metrics.count('sinks.sqs.count', 1);

	sqs.sendMessage({
		QueueUrl: sqsUrlEgest, MessageBody: message
	}, function(err, data) {
		if (err) { 
			console.log('sinks/sqs', err);
			metrics.count('sinks.sqs.error', 1);
		} else {
			console.log('sinks/sqs', data);
			metrics.count('sinks.sqs.ok', 1);
		}
	});
};
