/* global beforeEach, afterEach, describe, it, console */

'use strict';

var expect	= require('chai').expect;
var sinon	= require('sinon');
var fs		= require('fs');
var Mitm	= require("mitm")

var abApi = require('../../../dist/transforms').abApi;
var EventModel = require('../../../dist/models').EventModel;
			
var error = err => console.log(err);

var rawSqs = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest', { encoding: 'utf8' }));

describe('AB API', function() {

	beforeEach(() => {
		this.mitm = Mitm();
	})
	
	afterEach(() => {
		this.mitm.disable();
	})
	
	it('Sends a session token and allocation id to the AB API', done => {
		this.mitm.on("request", function(req, res) {
			expect(req.headers.host).to.equal('ft-next-ab.herokuapp.com');
			expect(req.url).to.equal('/spoor');
			expect(req.headers['ft-session-token']).to.include('z2ksOim4qUJt07yhJdmW9DvEzwAAAU39LNxSww.MEUCIDqpJ4GzXGMNstFXhyn');
			expect(req.headers['ft-allocation-id']).to.include('6f63be5d');
			done();
		})
		abApi(new EventModel(rawSqs));
	});
	
	it('Convert the AB segmentation to an object', done => {
		this.mitm.on("request", function(req, res) {
			res.setHeader('ft-ab', 'foo:on,boo:off');
			res.end();
		})
		abApi(new EventModel(rawSqs))
			.then(segments => {
				expect(segments).to.deep.equal({ foo: 'on', boo: 'off' });
				done();
			}).catch(error);
	});
	
	it('Account for failed segmentation (hyphenated headers)', done => {
		this.mitm.on("request", function(req, res) {
			res.setHeader('ft-ab', '-');
			res.end();
		})
		abApi(new EventModel(rawSqs))
			.then(segments => {
				expect(segments).to.deep.equal({});
				done();
			}).catch(error);
	});
	
	it('Account for failed segmentation (missing headers)', done => {
		this.mitm.on("request", function(req, res) {
			res.end();
		})
		abApi(new EventModel(rawSqs))
			.then(segments => {
				expect(segments).to.deep.equal({});
				done();
			}).catch(error);
	});
	
	it('Error from AB API', done => {
		this.mitm.on("request", function(req, res) {
			res.statusCode = 503;
			res.end();
		})	
		abApi(new EventModel(rawSqs))
			.then(function (res) {
				expect(res).to.deep.equal({});
				done();
			}).catch(error);
	});
	
});
