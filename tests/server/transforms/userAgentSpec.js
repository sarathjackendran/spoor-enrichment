/* global beforeEach, afterEach, describe, it, console */

'use strict';

var expect	= require('chai').expect;
var sinon	= require('sinon');
var fs		= require('fs');

var userAgent = require('../../../dist/transforms').userAgent;

// FIXME - needs a message model
var message = {
	ingest: JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest', { encoding: 'utf8' })),
	egest: {  user: {} }
}

describe('User agent', function () {
	
	beforeEach(() => {
		message.ingest.BodyAsJson = JSON.parse(message.ingest.Body);
	});

	it('Ignore messages with no user-agent header', done => {
		message.ingest.BodyAsJson.envelope.headers = null;
		var data = userAgent(message);
		expect(data.egest.user.ua).to.not.exist;
		done();
	});

	it('Tokenise the user-agent header', done => {
		var data = userAgent(message);
		expect(data.egest.user.ua.browser.name).to.be.equal('IE');
		done();
	});
	
});
