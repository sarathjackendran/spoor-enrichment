/* global beforeEach, afterEach, describe, it, console */

'use strict';

var expect	= require('chai').expect;
var sinon	= require('sinon');
var fs		= require('fs');

var userAgent = require('../../../dist/transforms').userAgent;
var EventModel	= require('../../../dist/models').EventModel;

var rawSqs = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest', { encoding: 'utf8' }));
var rawSqs__no_userAgent = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest--no-user-agent', { encoding: 'utf8' }));

describe('User agent', function () {

	it('Ignore messages with no user-agent header', done => {
		var e = userAgent(new EventModel(rawSqs__no_userAgent));
		expect(e.annotations()).to.not.exist;
		done();
	});

	it('Tokenise the user-agent header', done => {
		var e = userAgent(new EventModel(rawSqs));
		expect(e.annotations().ua.browser.name).to.be.equal('IE');
		done();
	});
	
});
