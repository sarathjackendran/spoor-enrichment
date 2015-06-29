
var moment = require('moment');

module.exports = function (event) {
	
	//event.

	var time = {
		weekday: !/^0|6$/.test(new Date().getDay()),
		day: new Date().toJSON().slice(0, 10) + 'T00:00:00Z',
		hour: new Date().toJSON().slice(0, 14) + '00:00Z',
		now: new Date().toJSON(),
		week: moment().format('YYYYw')
	}

	event.annotate('time', time);
	return event;
}
