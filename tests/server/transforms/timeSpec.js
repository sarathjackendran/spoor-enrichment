/* global beforeEach, afterEach, describe, it, console */

'use strict';

var expect	= require('chai').expect;
var sinon	= require('sinon');

var time	= require('../../../dist/transforms/time');

describe('Time', function () {
	
	it('Flag if the event happened on a weekend', done => {
		var t = sinon.useFakeTimers(new Date('2015-3-1').getTime());
		expect(time({}).time.weekday).to.equal(false);
		done();
	});

	it('Flag if the event happened on a weekday', done => {
		var t = sinon.useFakeTimers(new Date('2015-3-2').getTime());
		expect(time({}).time.weekday).to.equal(true);
		done()
	});

	it('Round the time of the event to the ISO day', done => {
		var t = sinon.useFakeTimers(new Date('2015-3-2').getTime());
		expect(time({}).time.day).to.equal('2015-03-02T00:00:00Z');
		done()
	});
	
	it('Round the week of the year the event happened', done => {
		var t = sinon.useFakeTimers(new Date('Mon, 15 Jun 2015 20:12:01 UTC').getTime());
		expect(time({}).time.week).to.equal('201525'); // 25th week of 2015
		done()
	});
	
	it('Round the time of the event to the ISO hour', done => {
		var t = sinon.useFakeTimers(new Date('Mon, 15 Jun 2015 20:12:01 UTC').getTime());
		expect(time({}).time.hour).to.equal('2015-06-15T20:00:00Z');
		done()
	});
	
	it('Round the time of the event being logged', done => {
		var t = sinon.useFakeTimers(new Date('Mon, 15 Jun 2015 20:12:01 UTC').getTime());
		expect(time({}).time.now).to.equal('2015-06-15T20:12:01.000Z');
		done()
	});

});
