
var moment		= require('moment');
var metrics		= require('next-metrics')

module.exports = function (event) {

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
		iso: {
			day: actualTime.toJSON().slice(0, 10) + 'T00:00:00Z',
			hour: actualTime.toJSON().slice(0, 14) + '00:00Z',
			now: actualTime.toJSON(),
		},
		dayOfWeek: moment(actualTime).format('d'),
		dayInWords: moment(actualTime).format('dddd'),
		dayOfYear: moment(actualTime).format('DDD'),
		month: moment(actualTime).format('M'),
		monthInWords: moment(actualTime).format('MMMM'),
		year: moment(actualTime).format('YYYY'),
		weekday: !/^0|6$/.test(actualTime.getDay()),
		week: moment(actualTime).format('YYYYw'),
		offset: offset
	}

	event.annotate('time', time);
	return event;
}
