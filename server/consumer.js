
var AWS			= require('aws-sdk'); 

var model		= require('./models');
var sink		= require('./sinks');
var statsd		= require('./lib/statsd');

require('es6-promise').polyfill();

AWS.config.update({
	accessKeyId: process.env.accessKey, 
	secretAccessKey: process.env.secretAccessKey, 
	"region": "eu-west-1"
});

var sqs = new AWS.SQS();
var sqsUrlIngest = process.env.SQS_INGEST;

(function pollQueueForMessages() {

	console.log('polling');
	statsd.increment('ingest.consumer.polling', 1);

	sqs.receiveMessage({
		QueueUrl: sqsUrlIngest,
		WaitTimeSeconds: 20
	}, function(err, data) {
			if (err) {
				console.log(err);
				statsd.increment('ingest.consumer.receiveMessage.error', 1);
			}
			else {

				statsd.increment('ingest.consumer.receiveMessage.success', 1);

				if (data.Messages && data.Messages.length > 1) {
					statsd.increment('ingest.consumer.receiveMessage.exceeded_length_expectation', 1);
				}

				if (data.Messages && data.Messages.length > 0) {

					var Message = data.Messages[0];
				
					var header = JSON.parse(Message.Body).envelope.headers;

					// Enrichments, each modelled as a promise that resolves with the decoration
					Promise
						.all([
							model.country(header),
							model.referrer(header['referer']),
							model.time(),
							model.isSubscriber(header['cookie']),
							model.userAgent(header['user-agent']),
							model.contentApi(header['referer']),
							model.geoLocation(),
							model.sessionApi(header['cookie']),
							model.sqsMessageMetadata(Message) // FIXME rename: ingest meta
						])
						.then(function (all) {		// FIXME time this promise.

							statsd.increment('ingest.consumer.receiveMessage.promise.resolved', 1);
							
							var country = all[0].country;
							var referrer = all[1].referrer;
							var time = all[2].time;
							var isSubscriber = all[3].isSubscriber;
							var ua = all[4].userAgent;
							var content = all[5];
							var session = all[7].session;
							var meta = all[8];

							Message.annotations = { 
										referer: referrer,
										ua: ua,
										country: country,
										isSubscriber: isSubscriber,
										ingestSQS: meta,
										session: session,
										membership: all[7],
										content: content
									}
						
							// 
							sink.kinesis(Message);

							Message.Body = JSON.parse(Message.Body);
						
							console.log('deleting', sqsUrlIngest, meta.ReceiptHandle);
							console.log('**** Message', JSON.stringify(Message)); // TODO - splice this on to the original message
							
							sink.sqs(Message);

							// FIXME don't delete message in production
						
							sqs.deleteMessage({
								QueueUrl: sqsUrlIngest,
								ReceiptHandle: meta.ReceiptHandle
							}, function(err, data) {
								if (err) {
									console.log('ERROR-1', err, err.stack);		// an error occurred
									statsd.increment('ingest.consumer.deleteMessage.error', 1);
								}
								else {
									console.log('DELETED', data);				// successful response		
									statsd.increment('ingest.consumer.deleteMessage.success', 1);
								}
							})

						}, function (err) {
							console.error('ERROR-2', err);
							statsd.increment('ingest.consumer.receiveMessage.promise.rejected', 1);
						})
						.catch(function (err) {
							console.error('ERROR-3', err);
							statsd.increment('ingest.consumer.receiveMessage.promise.rejected', 1);
						})
				}
				
				pollQueueForMessages();
			}
	});

})();
