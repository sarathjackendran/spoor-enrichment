
var fs			= require('fs');
var EventModel	= require('../../dist/models').EventModel;

const fixture = name => {
	var f = fs.readFileSync(`./tests/fixtures/${name}`, { encoding: 'utf-8' });
	return new EventModel(f);
} 

const fixtures = new Map([
	['invalid-event', fixture('valid-event')],
	['event', fixture('event')]
]);

module.exports = fixtures;
