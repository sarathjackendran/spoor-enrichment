/* global beforeEach, afterEach, describe, it, console */

'use strict';

var expect	= require('chai').expect;
var sinon	= require('sinon');
var fs		= require('fs');

var time	= require('../../../dist/transforms').time;
var EventModel	= require('../../../dist/models').EventModel;

var rawSqs = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest', { encoding: 'utf8' }));
var rawSqs__time_offset = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest--time-offset', { encoding: 'utf8' }));
var e;

describe('Time', function () {
	
	beforeEach(() => {
		e = new EventModel(rawSqs);
	});

	it('Flag if the event happened on a weekend', done => {
		var ft = sinon.useFakeTimers(new Date('2015-3-1').getTime());
		var t = time(e);
		expect(e.annotations().time.weekday).to.equal(false);
		done();
	});

	it('Flag if the event happened on a weekday', done => {
		var ft = sinon.useFakeTimers(new Date('2015-3-2').getTime());
		var t = time(e);
		expect(e.annotations().time.weekday).to.equal(true);
		done()
	});

	it('Round the time of the event to the ISO day', done => {
		var ft = sinon.useFakeTimers(new Date('2015-3-2').getTime());
		var t = time(e);
		expect(e.annotations().time.day).to.equal('2015-03-02T00:00:00Z');
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
		expect(e.annotations().time.hour).to.equal('2015-06-15T20:00:00Z');
		done()
	});
	
	it('Round the time of the event being logged', done => {
		var ft = sinon.useFakeTimers(new Date('Mon, 15 Jun 2015 20:12:01 UTC').getTime());
		var t = time(e);
		expect(e.annotations().time.now).to.equal('2015-06-15T20:12:01.000Z');
		done()
	});
	
	it('Use the offset time where specified', done => {
		var ft = sinon.useFakeTimers(new Date('Mon, 15 Jun 2015 20:12:01 UTC').getTime());
		var offset = new EventModel(rawSqs__time_offset);
		time(offset);
		expect(offset.annotations().time.now).to.equal('2015-06-15T20:10:21.000Z'); // now minus 10000ms
		expect(offset.annotations().time.offset).to.equal(100000);
		done();
	});

});
