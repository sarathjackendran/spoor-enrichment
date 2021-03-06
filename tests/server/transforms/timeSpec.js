/* global beforeEach, afterEach, describe, it, console */

'use strict';

var expect	= require('chai').expect;
var sinon	= require('sinon');
var fs		= require('fs');

var time	= require('../../../dist/transforms').time;
var EventModel	= require('../../../dist/models').EventModel;

var rawSqs = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest', { encoding: 'utf8' }));
var rawSqs__time_offset = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest--time-offset', { encoding: 'utf8' }));
var rawSqs__no_time_received = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest--no-time-received', { encoding: 'utf8' }));
var e;

describe('Time', function () {

	beforeEach(() => {
		e = new EventModel(rawSqs__no_time_received);
	});

	it('Flag if the event happened on a weekend', done => {
		var ft = sinon.useFakeTimers(new Date('2015-3-1').getTime());
		time(e).then(t => {
			expect(t.isWeekday).to.equal(false);
			done();
		});
	});

	it('Flag if the event happened on a weekday', done => {
		var ft = sinon.useFakeTimers(new Date('2015-3-2').getTime());
		time(e).then(t => {
			expect(t.isWeekday).to.equal(true);
			done();
		});
	});

	it('Round the time of the event to the ISO day', done => {
		var ft = sinon.useFakeTimers(new Date('2015-3-2').getTime());
		time(e).then(t => {
			expect(t.day).to.equal('2015-03-02T00:00:00Z');
			done();
		});
	});

	it('Round the week of the year the event happened', done => {
		var ft = sinon.useFakeTimers(new Date('Mon, 15 Jun 2015 20:12:01 UTC').getTime());
		time(e).then(t => {
			expect(t.week).to.equal('201525'); // 25th week of 2015
			done();
		});
	});

	it('Round the time of the event to the ISO hour', done => {
		var ft = sinon.useFakeTimers(new Date('Mon, 15 Jun 2015 20:12:01 UTC').getTime());
		time(e).then(t => {
			expect(t.hour).to.equal('2015-06-15T20:00:00Z');
			done();
		});
	});

	describe('Thirty minute interval', function() {
		it('Round the time of the event to hour just passed', done => {
			var ft = sinon.useFakeTimers(new Date('Mon, 15 Jun 2015 20:12:01 UTC').getTime());
			time(e).then(t => {
				expect(t.thirtyMinuteInterval).to.equal('2015-06-15T20:00:00.000Z');
				done();
			});
		});
		it('Round the time of the event to hour approaching', done => {
			var ft = sinon.useFakeTimers(new Date('Mon, 15 Jun 2015 20:47:01 UTC').getTime());
			time(e).then(t => {
				expect(t.thirtyMinuteInterval).to.equal('2015-06-15T21:00:00.000Z');
				done();
			});
		});
		it('Round the time of the event to the half hour just passed', done => {
			var ft = sinon.useFakeTimers(new Date('Mon, 15 Jun 2015 20:37:01 UTC').getTime());
			time(e).then(t => {
				expect(t.thirtyMinuteInterval).to.equal('2015-06-15T20:30:00.000Z');
				done();
			});
		});
		it('Round the time of the event to the half hour just approaching', done => {
			var ft = sinon.useFakeTimers(new Date('Mon, 15 Jun 2015 20:28:01 UTC').getTime());
			time(e).then(t => {
				expect(t.thirtyMinuteInterval).to.equal('2015-06-15T20:30:00.000Z');
				done();
			});
		});
	});

	it('Round the time of the event being logged', done => {
		var ft = sinon.useFakeTimers(new Date('Mon, 15 Jun 2015 20:12:01 UTC').getTime());
		time(e).then(t => {
			expect(t.now).to.equal('2015-06-15T20:12:01.000Z');
			done();
		});
	});

	it('Use the offset time where specified', done => {
		var ft = sinon.useFakeTimers(new Date('Mon, 15 Jun 2015 20:12:01 UTC').getTime());
		var offset = new EventModel(rawSqs__time_offset);
		time(offset).then(t => {
			expect(t.now).to.equal('2015-06-16T16:22:20.795Z'); // 'time received' minus 10000ms
			expect(t.offset).to.equal(100000);
			done();
		});
	});

	it('Use the time the event was received where specified', done => {
		var offset = new EventModel(rawSqs);
		time(offset).then(t => {
			expect(t.now).to.equal('2015-06-16T16:24:00.795Z');
			done();
		});
	});

	it('Generate various time tokens', done => {
		var ft = sinon.useFakeTimers(new Date('Mon, 15 Jun 2015 20:12:01 UTC').getTime());
		time(e).then(t => {
			expect(t.dayOfWeek).to.equal(1);
			expect(t.dayInWords).to.equal('Monday');
			expect(t.dayOfYear).to.equal(166);
			expect(t.date).to.equal(15);
			expect(t.month).to.equal(6);
			expect(t.monthInWords).to.equal('June');
			expect(t.year).to.equal(2015);
			done();
		});
	});
});
