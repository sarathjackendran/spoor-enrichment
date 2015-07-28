
var AWS				= require('aws-sdk'); 
var metrics			= require('next-metrics');

AWS.config.update({
	accessKeyId: process.env.accessKey, 
	secretAccessKey: process.env.secretAccessKey, 
	"region": "eu-west-1"
});

if (!process.env.SQS_INGEST) {
	throw new Error('You must set SQS_INGEST in your environment');
}

if (!process.env.SQS_EGEST) {
	throw new Error('You must set SQS_EGEST in your environment');
}

if (!process.env.SQS_DEAD_LETTER) {
	throw new Error('You must set SQS_DEAD_LETTER in your environment');
}

const sqs = new AWS.SQS();

var loadMetrics = (name, queue) => { 

	console.log('collecting sqs metrics for', name, queue);
	sqs.getQueueAttributes({
			QueueUrl: queue, AttributeNames: [
				'ApproximateNumberOfMessages',
				'ApproximateNumberOfMessagesDelayed',
				'ApproximateNumberOfMessagesNotVisible'
			] 
		}, function(err, data) {
			if (err) console.log(err, err.stack);
			else {
				console.log(data);
				metrics.count(`sqs.${name}.ApproximateNumberOfMessages`, parseInt(data.Attributes.ApproximateNumberOfMessages));
				metrics.count(`sqs.${name}.ApproximateNumberOfMessagesDelayed`, parseInt(data.Attributes.ApproximateNumberOfMessagesDelayed));
				metrics.count(`sqs.${name}.ApproximateNumberOfMessagesNotVisible`, parseInt(data.Attributes.ApproximateNumberOfMessagesNotVisible));
			}
		}
	);
}

setInterval(() => { loadMetrics('ingest', process.env.SQS_INGEST) }, 60000);
setInterval(() => { loadMetrics('egest', process.env.SQS_EGEST) }, 60000);
setInterval(() => { loadMetrics('dead_letter', process.env.SQS_DEAD_LETTER) }, 60000);
