/* global beforeEach, afterEach, describe, it, console */

'use strict';

var expect	= require('chai').expect;
var sinon	= require('sinon');
var fs		= require('fs');
var Mitm	= require("mitm")

var sessionApi = require('../../../dist/transforms').sessionApi;

// FIXME - needs a message model
var message = {
	ingest: JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest', { encoding: 'utf8' })),
	egest: {}
}
message.ingest.BodyAsJson = JSON.parse(message.ingest.Body);

describe('Session API', function () {

	beforeEach(() => {
		this.mitm = Mitm();
	})
	
	afterEach(() => {
		this.mitm.disable();
	})
	
	it('Validate a cookie against the Session API', done => {
		this.mitm.on("request", function(req, res) {
			expect(req.url).to.contain('/membership/sessions/z2ksOim4qUJt07yhJdmW9DvEzwAAAU39LNxSww');
			expect(req.headers['ft_api_key']).to.exist;
			done();
		})
		sessionApi(message);
	});

	it('Ignore messages with invalid cookies', done => {
		this.mitm.on("request", function(req, res) {
			res.statusCode = 404;	// Session API responds with 404 if the token is invalid
			res.end('{}');
		})	
		sessionApi(message)
			.then(function (user) {
				expect(user.uuid).to.not.exist;
				done();
			});
	});

	it('Ignore messages with no session token', done => {
		sessionApi({ ingest: { } })
			.then(function (user) {
				expect(user.uuid).to.not.exist;
				done();
			});
	});

	it('Ignore errors from the Session API', done => {
		this.mitm.on("request", function(req, res) {
			res.statusCode = 503;
			res.end('{}');
		})	
		sessionApi(message)
			.then(function (user) {
				expect(user.uuid).to.not.exist;
				done();
			});
	});
	
});
