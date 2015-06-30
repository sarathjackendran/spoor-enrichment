/* global beforeEach, afterEach, describe, it, console */

'use strict';

var expect	= require('chai').expect;
var sinon	= require('sinon');
var fs		= require('fs');

var url			= require('../../../dist/transforms').url;
var EventModel	= require('../../../dist/models').EventModel;

var rawSqs = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest', { encoding: 'utf8' }));
var rawSqs__url = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest--url', { encoding: 'utf8' }));
var rawSqs__no_referrer = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest--no-referrer', { encoding: 'utf8' }));
var e;

describe('Location', function () {
	
	it('Extract the referrer information from the header', done => {
		var e = new EventModel(rawSqs);
		url(e);
		expect(e.annotations().url.pathname).to.equal('/06d28cd0-055b-11e5-bb7d-00144feabdc0');
		done();
	});
	
	it('Ignore missing referrers', done => {
		var e = new EventModel(rawSqs__no_referrer);
		url(e);
		expect(e.annotations().url).to.not.be.defined;
		done();
	});
	
	it('Extract the location information from the message body', done => {
		var e = new EventModel(rawSqs__url);
		url(e);
		expect(e.annotations().url.pathname).to.equal('/search');
		done();
	});
	
	it('Extract the querystring paramters from the url', done => {
		var e = new EventModel(rawSqs__url);
		url(e);
		expect(e.annotations().url.querystring.page).to.equal('2');
		done();
	});

});