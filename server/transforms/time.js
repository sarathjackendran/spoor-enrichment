
var moment = require('moment');

module.exports = function (data) {
	data.time = {
		weekday: !/^0|6$/.test(new Date().getDay()),
		day: new Date().toJSON().slice(0, 10) + 'T00:00:00Z',
		hour: new Date().toJSON().slice(0, 14) + '00:00Z',
		now: new Date().toJSON(),
		week: moment().format('YYYYw')
	}
	return data;
}
