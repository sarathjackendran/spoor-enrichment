/* global beforeEach, afterEach, describe, it, console */

'use strict';

var expect	= require('chai').expect;
var sinon	= require('sinon');
var fs		= require('fs');

var referrer	= require('../../../dist/transforms').referrer;
var EventModel	= require('../../../dist/models').EventModel;

var rawSqs = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest', { encoding: 'utf8' }));
var rawSqs__no_referrer = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest--no-referrer', { encoding: 'utf8' }));
var e;

describe('Referrer', function () {
	
	it('Extract the referrer information from the header', done => {
		var e = new EventModel(rawSqs);
		referrer(e);
		expect(e.annotations().referrer.pathname).to.equal('/06d28cd0-055b-11e5-bb7d-00144feabdc0');
		done();
	});
	
	it('Ignore missing referrers', done => {
		var e = new EventModel(rawSqs__no_referrer);
		referrer(e);
		expect(e.annotations().referrer).to.not.be.defined;
		done();
	});

});
