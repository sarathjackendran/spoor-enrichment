/* global beforeEach, afterEach, describe, it, console */

'use strict';

var expect	= require('chai').expect;
var sinon	= require('sinon');
var fs		= require('fs');
var Mitm	= require("mitm")

var contentApi_v1 = require('../../../dist/transforms').contentApi_v1;
var EventModel = require('../../../dist/models').EventModel;

var rawSqs = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest', { encoding: 'utf8' }));
var rawSqs__no_referrer = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest--no-referrer', { encoding: 'utf8' }));
var rawSqs__content_id = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest--content-id', { encoding: 'utf8' }));
var capi_v1__response = fs.readFileSync('./tests/server/fixtures/capi-v1__response', { encoding: 'utf8' }); 

describe('Content API v1', function() {

	beforeEach(() => {
		this.mitm = Mitm();
	})
	
	afterEach(() => {
		this.mitm.disable();
	})
	
	it('Enrich an event with information from the Content API v1', done => {
		var e = new EventModel(rawSqs);
		this.mitm.on("request", function(req, res) {
			expect(req.headers.host).to.equal('api.ft.com');
			expect(req.url).to.equal('/content/items/v1/06d28cd0-055b-11e5-bb7d-00144feabdc0');
			expect(req.headers['x-api-key']).to.exist;
			done();
		})
		contentApi_v1(e);
	});

	it('Enrich an event with uuid, headline and published date', done => {
		var e = new EventModel(rawSqs);
		this.mitm.on("request", function(req, res) {
			res.statusCode = 200;
			res.end(capi_v1__response);
		})
		contentApi_v1(e)
			.then(function (content_v1) {
				console.log(content_v1);
				expect(content_v1.classification).to.equal('0');
				expect(content_v1.metadata.tags.length).to.equal(4);
				expect(content_v1.uuid).to.equal('06d28cd0-055b-11e5-bb7d-00144feabdc0');
				expect(content_v1.title).to.equal('Nigel Farage\’s pinstriped image belies modest City career');
				expect(content_v1.age).to.match(/[\d.]+/);
				expect(content_v1.publishedDate).to.equal('2015-02-06T15:05:52Z');
				expect(content_v1.wordCount).to.equal(1083);
				expect(content_v1.genre).to.equal('News');
				expect(content_v1.flags.hasGallery).to.equal(true);
				expect(content_v1.flags.hasLinksInBody).to.equal(true);
				expect(content_v1.flags.hasTableOfContents).to.equal(true);
				expect(content_v1.flags.hasPromoBox).to.equal(true);
				expect(content_v1.flags.hasPullQuote).to.equal(true);
				expect(content_v1.flags.hasVideo).to.equal(true);
				done();
			})
			.catch(err => console.log(err));
	});
	
	it('Pluck the reference the the content UUID from message body if it exists', done => {
		var e = new EventModel(rawSqs__content_id);
		this.mitm.on("request", function(req, res) {
			expect(req.url).to.equal('/content/items/v1/0f7464b4-3f4d-11e4-984b-00144feabdc0');
			done();
		});
		contentApi_v1(e)
			.catch(err => console.log(err));
	});

	
	it('Do not enrich articles with no referer or UUID in the message body', done => {
		var e = new EventModel(rawSqs__no_referrer);
		contentApi_v1(e)
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
		contentApi_v1(e)
			.then(function (res) {
				expect(res).to.deep.equal({});
				done();
			})
			.catch(err => console.log(err));
	});
	
});
