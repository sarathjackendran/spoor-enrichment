/* global beforeEach, afterEach, describe, it, console */

'use strict';

var expect		= require('chai').expect;
var fs			= require('fs');
var EventModel	= require('../../../dist/models').EventModel;

var rawSqs = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest', { encoding: 'utf8' }));
var rawSqs__no_message = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest--no-message', { encoding: 'utf8' }));

describe('Event', () => {

	describe('init', () => {
		
		it('to be defined', done => {
			expect(new EventModel(rawSqs)).to.be.defined;
			done();
		});

		it('Represent the ingest queue as JSON', done => {
			var e = new EventModel(rawSqs);
			expect(e.ingest._asJson.headers['user-agent']).to.contain('Mozilla/5.0 (Windows NT 6.3; Win64; x64;');
			expect(e.ingest._body.videoid).to.equal(4283366118001);
			console.log(e.ingest._body);
			done();
		});

		it('Do not explode when given bad JSON', done => {
			var e = new EventModel('{...}');
			expect(e.headers('user-agent')).to.be.undefined;
			done();
		});
		
		it('Do not explode when given *no* JSON', done => {
			var e = new EventModel();
			expect(e.headers('user-agent')).to.be.undefined;
			done();
		});
	
	})

	describe('headers', () => {
	
		it('Get a single ingest header', done => {
			var e = new EventModel(rawSqs);
			expect(e.headers('user-agent')).to.contain('Mozilla/5.0 (Windows NT 6.3; Win64; x64;');
			expect(e.headers('x-foo')).to.be.undefined;
			done();
		});
		
		it('Get all ingest headers', done => {
			var e = new EventModel(rawSqs);
			expect(e.headers()).to.be.an.object;
			expect(e.headers()['host']).to.contain('spoor-api.herokuapp.com');
			done();
		});
	
	});

	describe('body', () => {
	
		it('Get the ingest body via a convenience method', done => {
			var e = new EventModel(rawSqs);
			expect(e.body('videoid')).to.equal(4283366118001);
			expect(e.body('position').a).to.equal(315.374);
			done();
		});
		
		it('Gracefully handle an event with an empty message', done => {
			var e = new EventModel(rawSqs__no_message);
			expect(e.ingest._body).to.be.defined;
			expect(Object.keys(e.ingest._body).length).to.equal(0);
			done();
		});
	
	});

	describe('pluck', () => {
		
		it('Pluck nested value from the JSON body', done => {
			var e = new EventModel(rawSqs);
			expect(e.pluck('position.a')).to.equal(315.374);
			done();
		});
		
		it('Safely attempt to pluck a non-existent nested value from the JSON body', done => {
			var e = new EventModel(rawSqs);
			expect(e.pluck('a.not.here.property')).to.undefined;
			done();
		});

	});

	describe('annotate', () => {
	
		it('Set a property on the egest model', done => {
			var e = new EventModel(rawSqs);
			e.annotate('time', 123);
			expect(e.annotations()).to.deep.equal({time: 123});
			done();
		});
	
	});
	
	describe('received', () => {
	
		it('Get the time the event was received', done => {
			var e = new EventModel(rawSqs);
			expect(e.received().toISOString()).to.equal('2015-06-16T16:24:00.795Z');
			done();
		});
	
	});

});
