
var AWS				= require('aws-sdk'); 
var metrics			= require('next-metrics')

AWS.config.update({
	accessKeyId: process.env.accessKey, 
	secretAccessKey: process.env.secretAccessKey, 
	"region": "eu-west-1"
});

var sns = new AWS.SNS();
var arn = process.env.EGEST_ARN;

module.exports = function (message) {

	if (!process.env.sink_sqs) {
		console.log('sinks/sns', 'SNS sink is turned off');
		return;
	} 

	console.log('sinks/sns', 'writing message to SNS');
	
	metrics.count('sinks.sns.count', 1);

	sns.publish({
		TopicArn: arn,
		Message: JSON.stringify(message)
	}, function(err, data) {
		if (err) { 
			console.log('sinks/sns', err, err.stack);
			metrics.count('sinks.sns.error', 1);
		} else {
			console.log('sinks/sns', data);
			metrics.count('sinks.sns.ok', 1);
		}
	});
};
