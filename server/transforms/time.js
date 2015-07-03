
var moment = require('moment');

module.exports = function (event) {

	// the actual time of the event
	var offset = event.pluck('time.offset') || 0;
	var received = event.received();
	var actualTime = new Date(received - offset);

	console.log('transforms/time', event.received(), event.pluck('time.offset'), actualTime);

	var time = {
		weekday: !/^0|6$/.test(actualTime.getDay()),
		day: actualTime.toJSON().slice(0, 10) + 'T00:00:00Z',
		hour: actualTime.toJSON().slice(0, 14) + '00:00Z',
		now: actualTime.toJSON(),
		week: moment(actualTime).format('YYYYw'),
		offset: offset
	}

	event.annotate('time', time);
	return event;
}
