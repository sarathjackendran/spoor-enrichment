
var es				= require('event-stream');

var sinks			= require('../sinks');
var filters			= require('../filters');
var transforms		= require('../transforms');
var EventModel		= require('../models').EventModel;
var metrics			= require('next-metrics')

var EventEmitter	= require('events').EventEmitter;

const emitter = new EventEmitter();

emitter.on('enriched', sinks.kinesis);
emitter.on('enriched', sinks.sqs);

require('es6-promise').polyfill();

module.exports = stream => {
	var start = process.hrtime();
	stream
		.pipe(es.map((data, next) => {
			metrics.count('pipeline.v2.in', 1);
			next(null, data);
		}))
		.pipe(es.parse())
		.pipe(es.map((data, next) => {
			var event = new EventModel(data);
			next(null, event);
		}))
		.pipe(es.map((event, next) => {
			if (process.env.pipeline_model) { 
				next(null, filters.isValidSource(event));
			} else {
				next(null, event);	
			}
		}))
		.pipe(es.map((event, next) => {
			if (process.env.pipeline_geo) { 
				next(null, transforms.geo(event));
			} else {
				next(null, event);	
			}
		}))
		.pipe(es.map((event, next) => {
			if (process.env.pipeline_time) { 
				next(null, transforms.time(event));
			} else {
				next(null, event);	
			}
		}))
		.pipe(es.map((event, next) => {
			if (process.env.pipeline_ua) { 
				next(null, transforms.userAgent(event));
			} else {
				next(null, event);	
			}
		}))
		.pipe(es.map((event, next) => {
			if (process.env.pipeline_ingest) { 
				next(null, transforms.ingestQueueMetadata(event));
			} else {
				next(null, event);	
			}
		}))
		.pipe(es.map((event, next) => {
			if (process.env.pipeline_url) { 
				next(null, transforms.url(event));
			} else {
				next(null, event);	
			}
		}))
		.pipe(es.map((event, next) => {
			if (process.env.pipeline_apis) { 
				Promise.all([
						transforms.sessionApi(event),
						transforms.contentApi(event),
						transforms.abApi(event)
					])
					.then(all => {
						var [user, content, ab] = all;
						event.annotate('user', user);
						event.annotate('content', content);
						event.annotate('ab', ab);
						next(null, event);
					})
					.catch(err => {
						console.log('error', err);
						next(err, event);	// TODO annotate an 'error' flag
						metrics.count('pipeline.v2.error', 1);
					});
			} else {
				next(null, event);	
			}
		}))
		.pipe(es.stringify())
		.pipe(es.map((event, next) => {
			emitter.emit('enriched', event);
			metrics.count('pipeline.v2.out', 1);
			var end = process.hrtime(start);
			console.info("execution time (hr): %ds %dms", end[0], end[1]/1000000, end);
			next(null, event);
		}))
		.pipe(process.stdout)
}
