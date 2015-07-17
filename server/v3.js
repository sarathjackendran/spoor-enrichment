// `npm install rx randomstring es6-promise gulp babel gulp-babel` ; make run 

var AWS				= require('aws-sdk'); 
var pipelines		= require('./pipelines');
var metrics			= require('next-metrics')

metrics.init({ app: 'spoor-enrichment', flushEvery: 30000 });

// -------- Simulated SQS stream

AWS.config.update({
	accessKeyId: process.env.accessKey, 
	secretAccessKey: process.env.secretAccessKey, 
	"region": "eu-west-1"
});

var sqs = new AWS.SQS();
var sqsUrlIngest = process.env.SQS_INGEST;

var isProduction = process.env.NODE_ENV === 'production';

var sqsStream = () => {
	
	(function pollQueueForMessages() {
		
		metrics.count('ingest.consumer.sqs.polling', 1);
		
		sqs.receiveMessage({
			QueueUrl: sqsUrlIngest,
			WaitTimeSeconds: 20
		}, (err, data) => {

				if (err) {
					console.log(err);
					metrics.count('ingest.consumer.receiveMessage.error', 1);
					return;
				}

				if (!data.Messages) {
				
					console.log('Found no new messages');
					metrics.count('ingest.consumer.receiveMessage.no_message', 1);
				
				} else {
					
						console.log('Found a new message');

						// FIXME allow more than one message. FIXME. ideally we wouldn't do a JSON.stringify.
							
						metrics.count('ingest.consumer.receiveMessage.found', 1);

						if (process.env.pipeline) {
							var message = data.Messages[0];
							pipelines.promiseOfEnrichment(message)
								.then(function () {
				
									if (!isProduction) {
										return;
									}
									
									console.log('deleting message', sqsUrlIngest);

									sqs.deleteMessage({
										QueueUrl: sqsUrlIngest,
										ReceiptHandle: data.Messages[0].ReceiptHandle
									}, function(err, data) {
										if (err) {
											console.log('error deleting message', err, err.stack);		// an error occurred
											metrics.count('ingest.consumer.deleteMessage.error', 1);
										}
										else {
											console.log('delete ok', data);				// successful response		
											metrics.count('ingest.consumer.deleteMessage.success', 1);
										}
									})
								}).catch();
						}
				}

				pollQueueForMessages();
		})
	})();
}

metrics.count('stream.start', 1);
sqsStream();
