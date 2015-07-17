/* global beforeEach, afterEach, describe, it, console */

'use strict';

var expect	= require('chai').expect;
var sinon	= require('sinon');
var fs		= require('fs');

var userAgent = require('../../../dist/transforms').userAgent;
var EventModel	= require('../../../dist/models').EventModel;

var rawSqs = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest', { encoding: 'utf8' }));
var rawSqs__no_userAgent = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest--no-user-agent', { encoding: 'utf8' }));
var rawSqs__userAgent = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest--user-agent', { encoding: 'utf8' }));

describe('User agent', function () {

	it('Ignore messages with no user-agent header', done => {
		var e = userAgent(new EventModel(rawSqs__no_userAgent));
		e.then(ua => {
			expect(ua).to.deep.equal({});
			done();
		})
	});

	it('Tokenise the user-agent header', done => {
		var e = userAgent(new EventModel(rawSqs));
		e.then(ua => {
			expect(ua.browser.name).to.be.equal('IE');
			done();
		});	
	});

	it('Pluck the user-agent from message body if it exists', done => {
		var e = userAgent(new EventModel(rawSqs__userAgent));
		e.then(ua => {
			expect(ua.browser.name).to.be.equal('Chrome');
			done();
		});	
	});

});
