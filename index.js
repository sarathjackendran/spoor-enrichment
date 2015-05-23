
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
 
					var receiptId = data.Messages[0].ReceiptHandle;	
					// console.log(receiptId, data.Messages[0].Body);
					
					var header = JSON.parse(data.Messages[0].Body).envelope.headers;

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
							model.sessionApi()
						])
						.then(function (all) {
				
							// FIXME destructure

							var country = all[0].country;
							var referrer = all[1].referrer;
							var time = all[2].time;
							var isSubscriber = all[3].isSubscriber;
							var ua = all[4].userAgent;

							console.log(country, referrer, time, isSubscriber, ua);

							// FIXME attach some AWS Message meta data here
							var message = data.Messages[0];	// FIXME ideally we never batch process, so perhaps throw error when message.length > 1
							message.annotations = { 
										referer: referrer,
										ua: ua, 
										country: country,
										isSubscriber: isSubscriber
									}
						
							// 
							sink.sqs(message);
							sink.pusher(message.annotations);
							sink.redis(referrer);

							// FIXME don't delete message in production
							
							sqs.deleteMessage({
								QueueUrl: sqsUrlIngest,
								ReceiptHandle: receiptId 	
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
