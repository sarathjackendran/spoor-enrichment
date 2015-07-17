
var es				= require('event-stream');

var filter			= require('../filters');
var transform		= require('../transforms');
var EventModel		= require('../models').EventModel;
var metrics			= require('next-metrics')

var EventEmitter	= require('events').EventEmitter;
const emitter = new EventEmitter();

var Pipeline = () => {} 

/* FIXME maybe just export normal event listener */
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
			transform.userAgent(event),
			transform.sessionApi(event),
			transform.contentApi(event),
			transform.contentApi_v1(event),
			transform.abApi(event)
		]);

		// TODO - allow promises to fail
	})
	.then(annotations => {
		
		var [event, isValid, geo, cohort, ingest, time, ua, session, capi2, capi1, ab] = annotations;
		
		// calculate the end time in nano-seconds
		var end = process.hrtime(start);
		
		event.annotate('geo', geo);
		event.annotate('cohort', cohort);
		event.annotate('isValid', isValid);
		event.annotate('ingestQueueMetadata', ingest);
		event.annotate('time', time);
		event.annotate('ua', ua);
		event.annotate('session', session);
		event.annotate('capi2', capi2);
		event.annotate('capi1', capi1);
		event.annotate('ab', ab);
		event.annotate('pipeline', {
			execution_time: end,
			execution_time_in_seconds: parseFloat(`${end[0]}.${end[1]/1000000}`)
		});

		// all done		
		metrics.count('pipeline.v2.out', 1);
		emitter.emit('enriched', event);
	})	
	.catch(error => { 
		console.log('pipeline error', error);
	});

}

module.exports = Pipeline;
