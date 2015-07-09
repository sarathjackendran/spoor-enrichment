/* global beforeEach, afterEach, describe, it, console */

'use strict';

var expect	= require('chai').expect;
var sinon	= require('sinon');
var fs		= require('fs');
var Mitm	= require("mitm")

var sessionApi	= require('../../../dist/transforms').sessionApi;
var EventModel	= require('../../../dist/models').EventModel;

var rawSqs = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest', { encoding: 'utf8' }));
var rawSqs__no_session = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest--no-session', { encoding: 'utf8' }));
var rawSqs__session_id = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest--session-id', { encoding: 'utf8' }));
var e;

describe('Session API', function() {

	beforeEach(() => {
		e = new EventModel(rawSqs);
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
		sessionApi(e);
	});

	it('Ignore messages with invalid cookies', done => {
		this.mitm.on("request", function(req, res) {
			res.statusCode = 404;	// Session API responds with 404 if the token is invalid
			res.end('{}');
		})
		sessionApi(e)
			.then(function (user) {
				expect(user.uuid).to.not.exist;
				done();
			});
	});

	it('Ignore messages with no session token', done => {
		sessionApi(new EventModel(rawSqs__no_session))
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
		sessionApi(e)
			.then(function (user) {
				expect(user.uuid).to.not.exist;
				done();
			});
	});

	it('Pluck session token from the message body if it exists', done => {
		this.mitm.on("request", function(req, res) {
			expect(req.url).to.contain('/membership/sessions/091JfvQDPU4O04404aIec_H7zwAAAU5yl4bEww');
			expect(req.headers['ft_api_key']).to.exist;
			done();
		})
		sessionApi(new EventModel(rawSqs__session_id));
	});

});
