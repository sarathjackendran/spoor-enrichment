// `npm install rx randomstring es6-promise gulp babel gulp-babel` ; make run 

var AWS				= require('aws-sdk'); 
var Readable		= require('stream').Readable;
var domain			= require('domain');
var es				= require('event-stream');

var sinks			= require('./sinks');
var filters			= require('./filters');
var transforms		= require('./transforms');
var EventModel		= require('./models').EventModel;

var EventEmitter	= require('events').EventEmitter;

const emitter = new EventEmitter();

emitter.on('enriched', sinks.kinesis);
emitter.on('enriched', sinks.sqs);

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
			next(null, filters.isValidSource(event));
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
			next(null, transforms.ingestQueueMetadata(event));
		}))
		.pipe(es.map((event, next) => {
			next(null, transforms.ingestQueueMetadata(event));
		}))
		.pipe(es.map((event, next) => {
			next(null, transforms.referrer(event));
		}))
		.pipe(es.map((event, next) => {
			Promise.all([
					transforms.sessionApi(event),
					transforms.contentApi(event)
				])
				.then(all => {
					var [user, content] = all;
					event.annotate('user', user);
					event.annotate('content', content);
					next(null, event);
				})
				.catch(err => {
					console.log('error', err);
					next(err, event);	// TODO annotate an 'error' flag
				});
		}))
		.pipe(es.stringify())
		.pipe(es.map((event, next) => {
			emitter.emit('enriched', event);
			next(null, event);
		}))
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
							pipeline(sqsStream);
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
