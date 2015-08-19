
var es				= require('event-stream');

var filter			= require('../filters');
var transform		= require('../transforms');
var EventModel		= require('../models').EventModel;
var metrics			= require('next-metrics')
var	debug			= require('debug')('pipeline');

var EventEmitter	= require('events').EventEmitter;
const emitter = new EventEmitter();

var Pipeline = () => {} 

var roundedHiResTime = (time) => {
	var timeInSeconds = parseFloat(`${time[0]}.${time[1]/1000000}`);
	return Math.round(timeInSeconds * 10) * 100;
}

/* FIXME maybe just export normal event listener */
Pipeline.prototype.on = (fn) => { emitter.on('enriched', fn) };

Pipeline.prototype.process = (message) => {
		
	var start = process.hrtime();
			
	metrics.count('pipeline.in', 1);
	
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
			
		var transforms = [
			Promise.resolve(event),
			Promise.resolve(isValid),
			transform.geo(event),
			transform.cohort(event),
			transform.ingestQueueMetadata(event),
			transform.time(event),
			transform.url(event),
			transform.userAgent(event),
			transform.sessionApi(event),
			transform.contentApi(event),
			transform.contentApi_v1(event),
			transform.abApi(event)
		];

		return Promise.all(transforms.map(function (p) {	// allow rejections in individual promises without failing  
			return p.catch(function (err) {
				console.log('error', err);
				return undefined;
			});
		}));
	})
	.then(annotations => {
		
		var [event, isValid, geo, cohort, ingest, time, url, ua, session, capi2, capi1, ab] = annotations;

		// calculate the end time in nano-seconds
		var end = process.hrtime(start);
		
		event.annotate('ingest', event.body());
		event.annotate('geo', geo);
		event.annotate('cohort', cohort);
		event.annotate('validation', isValid);
		event.annotate('ingestQueueMetadata', ingest);
		event.annotate('time', time);
		event.annotate('ua', ua);
		event.annotate('referrer', url.referrer);
		event.annotate('url', url.location);
		event.annotate('user', session);
		event.annotate('content', capi2);
		event.annotate('content_v1', capi1);
		event.annotate('ab', ab);
		event.annotate('pipeline', {
			execution_time: end,
			execution_time_in_seconds: parseFloat(`${end[0]}.${end[1]/1000000}`)
		});
	
		return Promise.resolve(event);

	})	
	.then(event => {		// this set of enrichments are dependent on the first set 

		var transforms = [
			Promise.resolve(event),
			transform.myFtApi(event),
			transform.countedContent(event)
		];

		return Promise.all(transforms.map(function (p) {	// allow rejections in individual promises without failing  
			return p.catch(function (err) {
				console.log('error', err);
				return undefined;
			});
		}));
	})
	.then(annotations => {

		var [event, userPrefs, countedContent] = annotations;

		event.annotate('userPrefs', userPrefs);
		event.annotate('countedCounted', countedContent);

		console.log(JSON.stringify(event));

		// calculate the end time in nano-seconds
		var end = process.hrtime(start);
		metrics.count('pipeline.execution_time.' + roundedHiResTime(end), 1);
		
		debug('%s Event successfully enriched', event.ingest._headers['x-request-id']);
		
		// all done		
		metrics.count('pipeline.out', 1);
		emitter.emit('enriched', event);
	
	})
	.catch(error => { 
		console.log('pipeline error', error);
		metrics.count('pipeline.error', 1);
	});

}

module.exports = Pipeline;
