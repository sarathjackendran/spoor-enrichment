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
		var t = time(e);
		expect(e.annotations().time.isWeekday).to.equal(false);
		done();
	});

	it('Flag if the event happened on a weekday', done => {
		var ft = sinon.useFakeTimers(new Date('2015-3-2').getTime());
		var t = time(e);
		expect(e.annotations().time.isWeekday).to.equal(true);
		done()
	});

	it('Round the time of the event to the ISO day', done => {
		var ft = sinon.useFakeTimers(new Date('2015-3-2').getTime());
		var t = time(e);
		expect(e.annotations().time.iso.day).to.equal('2015-03-02T00:00:00Z');
		done()
	});
	
	it('Round the week of the year the event happened', done => {
		var ft = sinon.useFakeTimers(new Date('Mon, 15 Jun 2015 20:12:01 UTC').getTime());
		var t = time(e);
		expect(e.annotations().time.week).to.equal('201525'); // 25th week of 2015
		done()
	});
	
	it('Round the time of the event to the ISO hour', done => {
		var ft = sinon.useFakeTimers(new Date('Mon, 15 Jun 2015 20:12:01 UTC').getTime());
		var t = time(e);
		expect(e.annotations().time.iso.hour).to.equal('2015-06-15T20:00:00Z');
		done()
	});
	
	it('Round the time of the event being logged', done => {
		var ft = sinon.useFakeTimers(new Date('Mon, 15 Jun 2015 20:12:01 UTC').getTime());
		var t = time(e);
		expect(e.annotations().time.iso.now).to.equal('2015-06-15T20:12:01.000Z');
		done()
	});
	
	it('Use the offset time where specified', done => {
		var ft = sinon.useFakeTimers(new Date('Mon, 15 Jun 2015 20:12:01 UTC').getTime());
		var offset = new EventModel(rawSqs__time_offset);
		time(offset);
		expect(offset.annotations().time.iso.now).to.equal('2015-06-16T16:22:20.795Z'); // 'time received' minus 10000ms
		expect(offset.annotations().time.offset).to.equal(100000);
		done();
	});
	
	it('Use the time the event was received where specified', done => {
		var offset = new EventModel(rawSqs);
		time(offset);
		expect(offset.annotations().time.iso.now).to.equal('2015-06-16T16:24:00.795Z');
		done();
	});
	
	it('Generate various time tokens', done => {
		var ft = sinon.useFakeTimers(new Date('Mon, 15 Jun 2015 20:12:01 UTC').getTime());
		var t = time(e);
		expect(e.annotations().time.dayOfWeek).to.equal(1);
		expect(e.annotations().time.dayInWords).to.equal('Monday');
		expect(e.annotations().time.dayOfYear).to.equal(166);
		expect(e.annotations().time.date).to.equal(15);
		expect(e.annotations().time.month).to.equal(6);
		expect(e.annotations().time.monthInWords).to.equal('June');
		expect(e.annotations().time.year).to.equal(2015);
		done()
	});
});
