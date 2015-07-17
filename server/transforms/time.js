
var moment		= require('moment');
var metrics		= require('next-metrics')

module.exports = function (event) {

	return new Promise((resolve, reject) => {
		
		metrics.count('pipeline.transforms.time.count', 1);

		// the actual time of the event
		var offset = event.pluck('time.offset') || 0;
		var received = event.received();
		var actualTime = new Date(received - offset);

		// count # of offsets
		if (offset > 0) {
			metrics.count('pipeline.transforms.time.offset', 1);
		}

		var time = {
			day: actualTime.toJSON().slice(0, 10) + 'T00:00:00Z',
			hour: actualTime.toJSON().slice(0, 14) + '00:00Z',
			now: actualTime.toJSON(),
			dayOfWeek: parseInt(moment(actualTime).format('d')),
			dayInWords: moment(actualTime).format('dddd'),
			dayOfYear: parseInt(moment(actualTime).format('DDD')),
			date: parseInt(moment(actualTime).format('D')),
			month: parseInt(moment(actualTime).format('M')),
			monthInWords: moment(actualTime).format('MMMM'),
			year: parseInt(moment(actualTime).format('YYYY')),
			isWeekday: !/^0|6$/.test(actualTime.getDay()),
			week: moment(actualTime).format('YYYYw'),
			offset: offset
		}
		
		resolve(time);
	});

}
