/* global beforeEach, afterEach, describe, it, console */

'use strict';

var expect	= require('chai').expect;
var sinon	= require('sinon');
var fs		= require('fs');
var Mitm	= require("mitm")

var abApi		= require('../../../dist/transforms').abApi;
var EventModel	= require('../../../dist/models').EventModel;

var rawSqs = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest', { encoding: 'utf8' }));
var rawSqs__no_session = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest--no-session', { encoding: 'utf8' }));
var e;

describe('AB segmentation API', function() {

	beforeEach(() => {
		e = new EventModel(rawSqs);
		this.mitm = Mitm();
	})
	
	afterEach(() => {
		this.mitm.disable();
	})
	
	it('Retrieve a user test segments', done => {
		this.mitm.on("request", function(req, res) {
			expect(req.url).to.contain('/spoor');
			expect(req.headers['ft-session-token']).to.contain('z2ksOim4qUJt07yhJdmW9DvEzwAAAU39LNxSww');
			done();
		})
		abApi(e);
	});

	xit('Ignore messages with invalid cookies', done => {
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
		abApi(new EventModel(rawSqs__no_session))
			.then(function (ab) {
				expect(ab).to.not.exist;
				done();
			})
			.catch(err => console.log(err));
	});

	xit('Ignore errors from the Session API', done => {
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

});
