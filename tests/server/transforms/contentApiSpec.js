/* global beforeEach, afterEach, describe, it, console */

'use strict';

var expect	= require('chai').expect;
var sinon	= require('sinon');
var fs		= require('fs');
var Mitm	= require("mitm")

var contentApi = require('../../../dist/transforms').contentApi;
var EventModel = require('../../../dist/models').EventModel;

var rawSqs = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest', { encoding: 'utf8' }));
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
			expect(req.headers.host).to.equal('api.ft.com');
			expect(req.url).to.equal('/content/06d28cd0-055b-11e5-bb7d-00144feabdc0');
			expect(req.headers['x-api-key']).to.exist;
			done();
		})
		contentApi(e);
	});

});
