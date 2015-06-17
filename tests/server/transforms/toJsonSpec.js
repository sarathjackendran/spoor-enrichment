/* global beforeEach, afterEach, describe, it, console */

'use strict';

var expect	= require('chai').expect;
var sinon	= require('sinon');
var fs		= require('fs');

var toJson	= require('../../../dist/transforms').toJson;

var message = {
	ingest: JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest', { encoding: 'utf8' })),
	egest: {}
}

describe('to JSON', function () {
	
	it('convert the incoming Spoor message from a string to JSON', done => {
		expect(toJson(message).ingest.BodyAsJson.envelope.url.pathname).to.equal('/');
		done();
	});
	
	it('convert the incoming Spoor message body from a buffer to JSON', done => {
		console.log(toJson(message).ingest.message);
		expect(toJson(message).ingest.message.videoid).to.equal(4283366118001);
		done();
	});
	
	it('Do not barf on receiving invalid JSON', done => {
		expect(toJson('{"a":....}')).to.deep.equal({});
		done();
	});

});
