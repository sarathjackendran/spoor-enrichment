
var AWS				= require('aws-sdk'); 

AWS.config.update({
	accessKeyId: process.env.accessKey, 
	secretAccessKey: process.env.secretAccessKey, 
	"region": "eu-west-1"
});

var sqs = new AWS.SQS();
var sqsUrlEgest = process.env.SQS_EGEST;

module.exports = function (message) {
	
	console.log('Writing message to SQS');

	sqs.sendMessage({
		QueueUrl: sqsUrlEgest, MessageBody: message
	}, function(err, data) {
		console.log(err, data);
	});
};
