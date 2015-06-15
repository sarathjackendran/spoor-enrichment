// `npm install rx randomstring es6-promise gulp babel gulp-babel` ; make run 

var Rx				= require('rx');
var randomstring	= require("randomstring");
var transforms		= require('./transforms');
var filters			= require('./filters');

require('es6-promise').polyfill();

// -------- Simulated SQS stream

var sqsStream = new Rx.Subject();
var c = 0;
setInterval(() => {
	
	if (c > 99) return;

	console.log('SQS generated an event', c);
	sqsStream.onNext(JSON.stringify({
		session: randomstring.generate(),
		c: c++,
		event: {
			source: 123,
			action: 123
		}
	}));

}, 100);


// -------- Enrichment pipeline 

var subscribe = stream => {

	var enrichmentStream = stream
		.map(transforms.toJson)
		.filter(filters.isValidSource)
		.map(transforms.time)
		.subscribe(
			success => {
				console.log('Next', JSON.stringify(success))	// Eg. push to kinesis
			},
			err => {
				console.log('Error: ' + err);
				subscribe(stream);
			}
		)
}

// subscribe the stream 
subscribe(sqsStream);

