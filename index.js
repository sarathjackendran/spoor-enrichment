
var AWS			= require('aws-sdk'); 
var Pusher		= require('pusher');
var UAParser	= require('ua-parser-js');

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
					
					var h = JSON.parse(data.Messages[0].Body).envelope.headers;

					var parser		= new UAParser();
					parser.setUA(h['user-agent']);

					if (Math.random() < 0.01) { 
						pusher.trigger('test_channel', 'my_event', {
							"message": { 
								referer: h.referer,
								ua: parser.getResult(),
								country: h['x-geoip-country'] || 'unknown'
							}
						});
					}

					sqs.deleteMessage({
						QueueUrl: sqsUrl,
						ReceiptHandle: receiptId 	
					}, function(err, data) {
						if (err) console.log(err, err.stack); // an error occurred
						else     console.log('DELETED', data);           // successful response		
					})
			
				}
	
				pollQueueForMessages();
			}
	});

})();
