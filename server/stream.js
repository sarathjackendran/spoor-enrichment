// `npm install rx randomstring es6-promise gulp babel gulp-babel` ; make run 

var AWS				= require('aws-sdk'); 
var transforms		= require('./transforms');
var filters			= require('./filters');
var EventModel		= require('./models').EventModel;
var Readable		= require('stream').Readable;
var domain			= require('domain');
var es				= require('event-stream');

require('es6-promise').polyfill();

// -------- Simulated SQS stream

AWS.config.update({
	accessKeyId: process.env.accessKey, 
	secretAccessKey: process.env.secretAccessKey, 
	"region": "eu-west-1"
});

var sqs = new AWS.SQS();
var sqsUrlIngest = process.env.SQS_INGEST;

// -------- Enrichment pipeline 

var pipeline = stream => {
	stream
		.pipe(es.parse())
		.pipe(es.map((data, next) => {
			var event = new EventModel(data);
			next(null, event);
		}))
		.pipe(es.map((event, next) => {
			next(null, transforms.geo(event));
		}))
		.pipe(es.map((event, next) => {
			next(null, transforms.time(event));
		}))
		.pipe(es.map((event, next) => {
			next(null, transforms.userAgent(event));
		}))
		.pipe(es.map((event, next) => {
			transforms.sessionApi(event)
				.then(user => {
					event.annotate('user', user);
					next(null, event);
				})
				.catch(err => {
					next(err, event);	// TODO annotate an 'error' flag
				});
		}))
		.pipe(es.stringify())
		.pipe(process.stdout)
}
	
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
					pollQueueForMessages();
					return;
				}

				var d = domain.create();
				
				d.on('error', function (err) {
					console.log('error', err)
				});
				
				d.run(function() {
			
					var sqsStream = new Readable();
					sqsStream._read = function noop() {};
					sqsStream.push(JSON.stringify(data.Messages[0])); // FIXME allow more than one message. FIXME. ideally we wouldn't do a JSON.stringify.
					sqsStream.push(null)
					
					pipeline(sqsStream);

				})

				pollQueueForMessages();
		})
	})();
}

sqsStream();
