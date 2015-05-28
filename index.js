
var AWS			= require('aws-sdk'); 

var UAParser	= require('ua-parser-js');
var model		= require('./models');
var sink		= require('./sinks');

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
	
	sqs.receiveMessage({
		QueueUrl: sqsUrlIngest,
		WaitTimeSeconds: 20
	}, function(err, data) {
			if (err) console.log(err, err.stack); // an error occurred
			else {

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
							model.contentApi(),
							model.geoLocation(),
							model.sessionApi(),
							model.sqsMessageMetadata(Message) // FIXME rename: ingest meta
						])
						.then(function (all) {
				
							// FIXME destructure

							var country = all[0].country;
							var referrer = all[1].referrer;
							var time = all[2].time;
							var isSubscriber = all[3].isSubscriber;
							var ua = all[4].userAgent;
							var meta = all[8];

							Message.annotations = { 
										referer: referrer,
										ua: ua, 
										country: country,
										isSubscriber: isSubscriber,
										message: meta
									}
						
							// 
							sink.kinesis(Message);
							sink.sqs(Message);

							console.log(Message);

							// FIXME - move these two sinks to the egest consumer
							sink.pusher(Message.annotations);
							sink.redis(referrer);

							// FIXME don't delete message in production
							
							sqs.deleteMessage({
								QueueUrl: sqsUrlIngest,
								ReceiptHandle: meta.ReceiptHandle
							}, function(err, data) {
								if (err) console.log(err, err.stack); // an error occurred
								else     console.log('DELETED', data);           // successful response		
							})

						}, function (err) {
							console.error('ERROR', err);
						})
						.catch(function (err) {
							console.error('ERROR', err);
						})
				}
				
				pollQueueForMessages();
			}
	});

})();
