/* global beforeEach, afterEach, describe, it, console */

'use strict';

var expect	= require('chai').expect;
var sinon	= require('sinon');
var fs		= require('fs');
var Mitm	= require("mitm")

var deviceAtlas = require('../../../dist/transforms').deviceAtlas;
var EventModel = require('../../../dist/models').EventModel;

var err = error => console.error(error);

var rawSqs = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest', { encoding: 'utf8' }));

describe('Device Atlas', function() {

	beforeEach(() => {
		this.mitm = Mitm();
	})
	
	afterEach(() => {
		this.mitm.disable();
	})
	
	it.skip('Enrich an event with information from the Device Atlas API', done => {
		var e = new EventModel(rawSqs);
		this.mitm.on("request", function(req, res) {
			// FIXME expect(...)
			// expect(req.headers.host).to.equal('api.ft.com');
			// expect(req.url).to.equal('/content/items/v1/06d28cd0-055b-11e5-bb7d-00144feabdc0');
			// expect(req.headers['x-api-key']).to.exist;
			done();
		})
		deviceAtlas(e);
	});

	it.skip('Pluck the user-agent reference from the header if not specified in the event\'s body', done => {
		var e = new EventModel(rawSqs);
		this.mitm.on("request", function(req, res) {
			// FIXME expect(...)
			done();
		});
		deviceAtlas(e)
			.catch(err => console.log(err));
	});

	
	it.skip('Do not enrich events with no user-agent associated', done => {
		var e = new EventModel(rawSqs);
		contentApi_v1(e)
			.then(function (res) {
				// FIXME expect(res).to.deep.equal({});
				done();
			});
	});
		

	it('Error from Device Atlas', done => {
		var e = new EventModel(rawSqs);
		this.mitm.on("request", function(req, res) {
			res.statusCode = 503;
			res.end('{}');
		})	
		deviceAtlas(e)
			.then(function (res) {
				console.log('RES', res);
				expect(res).to.deep.equal({});
				done();
			})
			.catch(err);
	});
	
});
