
var AWS			= require('aws-sdk'); 
var Pusher		= require('pusher');
var UAParser	= require('ua-parser-js');
var model		= require('./models');

require('es6-promise').polyfill();

var pusher = new Pusher({
	appId: '120775',
	key: '49081db0b492f38c9f37',
	secret: '5a3aebf15ae9755a5677'
});

AWS.config.update({
	accessKeyId: process.env.accessKey, 
	secretAccessKey: process.env.secretAccessKey, 
	"region": "eu-west-1"
});

var sqs = new AWS.SQS();
var sqsUrl = process.env.SQS_URL;

(function pollQueueForMessages() {

	console.log('polling');
	sqs.receiveMessage({
		QueueUrl: sqsUrl,
		WaitTimeSeconds: 20
	}, function(err, data) {
			if (err) console.log(err, err.stack); // an error occurred
			else {

				if (data.Messages && data.Messages.length > 0) {
 
					var receiptId = data.Messages[0].ReceiptHandle;	
					console.log(receiptId, data.Messages[0].Body);
					
					var header = JSON.parse(data.Messages[0].Body).envelope.headers;

					// Enrichments, each modelled as a promise that resolves with the decoration
					Promise
						.all([
							model.country(header),
							model.referrer(header['referer']),
							model.time(),
							model.isSubscriber(header['cookie']),
							model.userAgent(header['user-agent'])
						])
						.then(function (all) {
				
							// FIXME destructure
							console.log(all);

							var country = all[0].country;
							var referrer = all[1].referrer;
							var time = all[2].time;
							var isSubscriber = all[3].isSubscriber;
							var ua = all[4].userAgent;

							console.log(country, referrer, time, isSubscriber, ua);

							if (Math.random() < 0.02) { 
								pusher.trigger('test_channel', 'my_event', {
									"message": { 
										referer: referrer,
										ua: ua, 
										country: country,
										isSubscriber: isSubscriber
									}
								});
							}

							// FIXME don't delete message != production
							
							sqs.deleteMessage({
								QueueUrl: sqsUrl,
								ReceiptHandle: receiptId 	
							}, function(err, data) {
								if (err) console.log(err, err.stack); // an error occurred
								else     console.log('DELETED', data);           // successful response		
							})

						}, function (err) {
							console.error(err);
						})
						.catch(function (err) {
							console.error(err);
						})
				}
				
				pollQueueForMessages();
			}
	});

})();
