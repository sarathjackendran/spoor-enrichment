/* global beforeEach, afterEach, describe, it, console */

'use strict';

var expect	= require('chai').expect;
var sinon	= require('sinon');
var fs		= require('fs');

var url		= require('../../../dist/transforms').url;
var EventModel	= require('../../../dist/models').EventModel;

var rawSqs = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest', { encoding: 'utf8' }));
var rawSqs__url = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest--url', { encoding: 'utf8' }));
var rawSqs__no_referrer = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest--no-referrer', { encoding: 'utf8' }));
var rawSqs__referrer = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest--referrer', { encoding: 'utf8' }));

var error = e => console.log(e);

describe('Location', function () {

	it('Extract the referrer information from the header', done => {
		var e = new EventModel(rawSqs);
		url(e)
			.then(u => {
				expect(u.referrer.pathname).to.equal('/06d28cd0-055b-11e5-bb7d-00144feabdc0');
				done();
			}).catch(error)
	});

	it('Pluck the referrer information from the message body', done => {
		var e = new EventModel(rawSqs__referrer);
		url(e)
			.then(u => {
				expect(u.referrer.pathname).to.equal('/christmas');
				done();
			}).catch(error)
	});

	it('Ignore missing referrers', done => {
		var e = new EventModel(rawSqs__no_referrer);
		url(e)
			.then(u => {
				expect(u.referrer).to.not.be.defined;
				done();
			}).catch(error)
	});

	it('Extract the location information from the message body', done => {
		var e = new EventModel(rawSqs__url);
		url(e)
			.then(u => {
				expect(u.location.pathname).to.equal('/search');
				done();
			}).catch(error)
	});

	it('Extract the querystring paramters from the url', done => {
		var e = new EventModel(rawSqs__url);
		url(e)
			.then(u => {
				expect(u.location.querystring.q).to.equal('sausages');
				expect(u.location.querystring.page).to.equal('2');
				done();
			}).catch(error)
	});
	
	it('Tokenise the hostname', done => {
		var e = new EventModel(rawSqs__url);
		url(e)
			.then(u => {
				expect(u.location.domains).to.deep.equal(['next', 'ft', 'com']);
				expect(u.referrer.domains).to.deep.equal(['next', 'ft', 'com']);
				done();
			}).catch(error)
	});

});
