// `npm install rx randomstring es6-promise gulp babel gulp-babel` ; make run 

var AWS				= require('aws-sdk'); 
var Rx				= require('rx');
var randomstring	= require("randomstring");
var transforms		= require('./transforms');
var filters			= require('./filters');

require('es6-promise').polyfill();

// -------- Simulated SQS stream

AWS.config.update({
	accessKeyId: process.env.accessKey, 
	secretAccessKey: process.env.secretAccessKey, 
	"region": "eu-west-1"
});

var sqs = new AWS.SQS();
var sqsUrlIngest = process.env.SQS_INGEST;
var subject = new Rx.Subject();
	
var sqsStream = function () {
	
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
			
				// The raw ingest feed is transform, copied etc. over to the egest
				var message = {
					ingest: data.Messages[0],
					egest: { 
						user: { }
					}
				}

				subject.onNext(message)
				pollQueueForMessages();
		})
	})();

	return subject;
}

// -------- Enrichment pipeline 

var subscribe = stream => {

	var enrichmentStream = stream
		.do(function (d) {
			//console.log(d);
		})
		.map(transforms.toJson)
		.map(transforms.ingestQueueMetadata)
		//.filter(filters.isValidSource)		// FIXME
		.map(transforms.time)
		.flatMap(data => {
			return Promise.all([
				Promise.resolve(data),
				transforms.sessionApi(data)	
			])
		})
		.map(data => {
			var [event, session] = data;
			event.egest.user.session = session.token;
			event.egest.user.uuid = session.uuid;
			return event;
		})
		.subscribe(
			success => {
				console.log('Next', JSON.stringify(success))
			},
			err => {
				console.log('Error: ' + err);
				subscribe(stream);
			}
		)
}

// subscribe the stream 
subscribe(sqsStream());

sqsStream()
