
var AWS		= require('aws-sdk'); 
var Pusher	= require('pusher');

var pusher = new Pusher({
	appId: '120682',
	key: 'af071ada76d9942edfb4',
	secret: '56978c0c8db02aa2e337'
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
					
					pusher.trigger('test_channel', 'my_event', {
						"message": JSON.parse(data.Messages[0].Body).envelope.headers.referer
					});


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
