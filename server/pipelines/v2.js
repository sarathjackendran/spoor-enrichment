
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
			next(null, transforms.url(event));
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
					metrics.count('pipeline.v2.error', 1);
				});
		}))
		.pipe(es.stringify())
		.pipe(es.map((event, next) => {
			emitter.emit('enriched', event);
			metrics.count('pipeline.v2.out', 1);
			next(null, event);
		}))
		.pipe(process.stdout)
}
