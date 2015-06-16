/* global beforeEach, afterEach, describe, it, console */

'use strict';

var expect	= require('chai').expect;
var sinon	= require('sinon');
var fs		= require('fs');

var ingestQueueMetadata	= require('../../../dist/transforms').ingestQueueMetadata;

var message = {
	ingest: fs.readFileSync('./tests/server/fixtures/ingest', { encoding: 'utf8' }),
	egest: {}
}

describe('Ingest queue metadata', function () {
	
	it('To copy the raw SQS message to the egest message', done => {
		var m = ingestQueueMetadata(message);
		expect(m.egest.spoor.ingest.raw).to.contain('759a53e9a565461a99df2bfae929b5e0');
		expect(m.egest.spoor.ingest.raw).to.be.a.string;
		done();
	});

});
