/* global beforeEach, afterEach, describe, it, console */

'use strict';

var expect	= require('chai').expect;
var sinon	= require('sinon');
var fs		= require('fs');
var Mitm	= require("mitm")

var contentApi = require('../../../dist/transforms').contentApi;
var EventModel = require('../../../dist/models').EventModel;

var rawSqs = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest', { encoding: 'utf8' }));
var rawSqs__no_referrer = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest--no-referrer', { encoding: 'utf8' }));
var rawSqs__content_id = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest--content-id', { encoding: 'utf8' }));
var capi__response = fs.readFileSync('./tests/server/fixtures/capi__response', { encoding: 'utf8' }); 

describe('Content API', function() {

	beforeEach(() => {
		this.mitm = Mitm();
	})
	
	afterEach(() => {
		this.mitm.disable();
	})
	
	it('Enrich an event with information from the Content API', done => {
		var e = new EventModel(rawSqs);
		this.mitm.on("request", function(req, res) {
			expect(req.headers.host).to.equal('api.ft.com');
			expect(req.url).to.equal('/content/06d28cd0-055b-11e5-bb7d-00144feabdc0');
			expect(req.headers['x-api-key']).to.exist;
			done();
		})
		contentApi(e);
	});
	
	it('Enrich an event with uuid, headline and published date', done => {
		var e = new EventModel(rawSqs);
		this.mitm.on("request", function(req, res) {
			res.statusCode = 200;
			res.end(capi__response);
		})
		contentApi(e)
			.then(function (content) {
				console.log('****************', content);
				expect(content.uuid).to.equal('06d28cd0-055b-11e5-bb7d-00144feabdc0');
				expect(content.title).to.equal('Osborne bids to bring voters onside with pre-poll Budget');
				expect(content.publishedDate).to.equal('2015-03-17T19:43:46.000Z');
				done();
			});
	});
	
	it('Pluck the reference the the content UUID from message body if it exists', done => {
		var e = new EventModel(rawSqs__content_id);
		this.mitm.on("request", function(req, res) {
			expect(req.url).to.equal('/content/0f7464b4-3f4d-11e4-984b-00144feabdc0');
			done();
		});
		contentApi(e)
			.catch(err => console.log(err));
	});

	
	it('Do not enrich articles with no referer or UUID in the message body', done => {
		var e = new EventModel(rawSqs__no_referrer);
		contentApi(e)
			.then(function (res) {
				expect(res).to.deep.equal({});
				done();
			});
	});
		

	it('Error from Content API', done => {
		var e = new EventModel(rawSqs);
		this.mitm.on("request", function(req, res) {
			res.statusCode = 503;
			res.end('{}');
		})	
		contentApi(e)
			.then(function (res) {
				expect(res).to.deep.equal({});
				done();
			})
			.catch(err => console.log(err));
	});
	
});
