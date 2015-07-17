
var es				= require('event-stream');

var sinks			= require('../sinks');
var filter			= require('../filters');
var transform		= require('../transforms');
var EventModel		= require('../models').EventModel;
var metrics			= require('next-metrics')

var EventEmitter	= require('events').EventEmitter;
const emitter = new EventEmitter();

emitter.on('enriched', sinks.kinesis);	// externalise in v3
emitter.on('enriched', sinks.sqs);

var Pipeline = () => {} 

Pipeline.prototype.on = (fn) => { emitter.on('enriched', fn) };

Pipeline.prototype.process = (message) => {
		
	var start = process.hrtime();
			
	metrics.count('pipeline.v2.in', 1);
	
	return new Promise((resolve, reject) => {
		resolve(new EventModel(message));
	})
	.then(event => {
		return Promise.all([
			Promise.resolve(event),
			filter.isValidSource(event)
		]);
	})
	.then(annotations => {
		var [event, isValid] = annotations;
		return Promise.all([
			Promise.resolve(event),
			Promise.resolve(isValid),
			transform.geo(event),
			transform.cohort(event),
			transform.ingestQueueMetadata(event),
			transform.time(event),
			transform.userAgent(event)
		]);
	})
	.then(annotations => {
		
		var [event, isValid, geo, cohort, ingest, time, ua] = annotations;
		
		// calculate the end time in nano-seconds
		var end = process.hrtime(start);
		
		event.annotate('geo', geo);
		event.annotate('cohort', cohort);
		event.annotate('isValid', isValid);
		event.annotate('ingestQueueMetadata', ingest);
		event.annotate('time', time);
		event.annotate('ua', ua);
		
		event.annotate('pipeline', {
			execution_time: end,
			execution_time_in_seconds: parseFloat(`${end[0]}.${end[1]/1000000}`)
		});
		emitter.emit('enriched', event);
	})	
	.catch(error => { 
		console.log('pipeline error', error);
	});

}


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
