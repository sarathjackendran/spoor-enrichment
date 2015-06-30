// `npm install rx randomstring es6-promise gulp babel gulp-babel` ; make run 

var AWS				= require('aws-sdk'); 
var Readable		= require('stream').Readable;
var domain			= require('domain');
var pipelines		= require('./pipelines');

// -------- Simulated SQS stream

AWS.config.update({
	accessKeyId: process.env.accessKey, 
	secretAccessKey: process.env.secretAccessKey, 
	"region": "eu-west-1"
});

var sqs = new AWS.SQS();
var sqsUrlIngest = process.env.SQS_INGEST;
	
var sqsStream = () => {
	
	(function pollQueueForMessages() {
		console.log('polling');
		sqs.receiveMessage({
			QueueUrl: sqsUrlIngest,
			WaitTimeSeconds: 20
		}, (err, data) => {

				if (err) {
					console.log(err);
					return;
				}

				if (!data.Messages) {
					
					console.log('Found no new messages');
				
				} else {
					
					console.log('Found a new message');

						// FIXME allow more than one message. FIXME. ideally we wouldn't do a JSON.stringify.

						var sqsStream = new Readable();
						sqsStream._read = function noop() {};
						sqsStream.push(JSON.stringify(data.Messages[0]));
						sqsStream.push(null);
						
						var d = domain.create();
						
						d.on('error', function (err) {
							console.log('error processing message', err, data.Messages[0])
						});
						
						d.run(function() {
							pipelines.v2(sqsStream);
						})

						console.log('deleting message', sqsUrlIngest);
						
						sqs.deleteMessage({
							QueueUrl: sqsUrlIngest,
							ReceiptHandle: data.Messages[0].ReceiptHandle
						}, function(err, data) {
							if (err) {
								console.log('error deleting message', err, err.stack);		// an error occurred
								//statsd.increment('ingest.consumer.deleteMessage.error', 1);
							}
							else {
								console.log('delete ok', data);				// successful response		
								//statsd.increment('ingest.consumer.deleteMessage.success', 1);
							}
						})

					//})
				}

				pollQueueForMessages();
		})
	})();
}

sqsStream();
