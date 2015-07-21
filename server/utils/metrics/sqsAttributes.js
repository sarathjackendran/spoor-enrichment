
var AWS				= require('aws-sdk'); 
var metrics			= require('next-metrics');

AWS.config.update({
	accessKeyId: process.env.accessKey, 
	secretAccessKey: process.env.secretAccessKey, 
	"region": "eu-west-1"
});

var sqs = new AWS.SQS();
var sqsUrl = process.env.SQS_INGEST;

setInterval(function () {
	console.log('collecting sqs metrics');
	sqs.getQueueAttributes({
			QueueUrl: sqsUrl, AttributeNames: [
				'ApproximateNumberOfMessages',
				'ApproximateNumberOfMessagesDelayed',
				'ApproximateNumberOfMessagesNotVisible'
			] 
		}, function(err, data) {
			if (err) console.log(err, err.stack); // an error occurred
			else {
				console.log(data);
				metrics.count('sqs.ApproximateNumberOfMessages', parseInt(data.Attributes.ApproximateNumberOfMessages));
				metrics.count('sqs.ApproximateNumberOfMessagesDelayed', parseInt(data.Attributes.ApproximateNumberOfMessagesDelayed));
				metrics.count('sqs.ApproximateNumberOfMessagesNotVisible', parseInt(data.Attributes.ApproximateNumberOfMessagesNotVisible));
			}
		}
	);
}, 6000);
