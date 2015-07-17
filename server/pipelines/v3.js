
var es				= require('event-stream');

var sinks			= require('../sinks');
var filter			= require('../filters');
var transforms		= require('../transforms');
var EventModel		= require('../models').EventModel;
var metrics			= require('next-metrics')

var EventEmitter	= require('events').EventEmitter;

const emitter = new EventEmitter();

emitter.on('enriched', sinks.kinesis);
emitter.on('enriched', sinks.sqs);

require('es6-promise').polyfill();

var Pipeline = () => {} 

Pipeline.prototype.process = (message) => {
		
	var start = process.hrtime();
			
	metrics.count('pipeline.v2.in', 1);
	
	return new Promise((resolve, reject) => {
		resolve(new EventModel(message));
	}).then(event => {
		
		return Promise.all([
			filter.isValidSource(event)
		]);

	})
	.then(annotations => {
		emitter.emit('enriched', annotations);
	})	
	.catch(error => { 
		console.log('pipeline error', error);
	});

}

Pipeline.prototype.on = emitter.on;

module.exports = Pipeline;

	/*
	.then(event => {
		
		var enrichments = [
				transforms.time(event);
				transforms.geo(event);
				transforms.userAgent(event);
				transforms.ingestQueueMetadata(event);
				transforms.url(event);
				transforms.sessionApi(event),
				transforms.contentApi(event),
				transforms.contentApi_v1(event),
				transforms.abApi(event)
			]
		
		Promise
			.all(t.map(function (p) {	// allow rejections in individual promises without failing  
				return p.catch(function (err) {
					console.log('error', err);
					return undefined;
				});
			}))
			.then(all => {
				var [user, content, content_v1, ab] = all;
				event.annotate('user', user);
				event.annotate('content', content);
				event.annotate('content_v1', content_v1);
				event.annotate('ab', ab);
				next(null, event);
			})
			.catch(err => {
				console.log('error', err);
				next(err, event);	// TODO annotate an 'error' flag
				metrics.count('pipeline.v2.error', 1);
			});
	})
		*/
		
		/*.pipe(es.map((event, next) => {
			emitter.emit('enriched', event);
			metrics.count('pipeline.v2.out', 1);
			
			// timing
			var end = process.hrtime(start);
			console.info("execution time (hr): %ds %dms", end[0], end[1]/1000000, end);
			
			if (end[1]/1000000 > 100) {
				metrics.count('pipeline.v2.execution_time.exceeded_100ms', 1);
			}
			
			if (end[1]/1000000 > 500) {
				metrics.count('pipeline.v2.execution_time.exceeded_500ms', 1);
			}

			next(null, event);
			.pipe(process.stdout)
		*/
