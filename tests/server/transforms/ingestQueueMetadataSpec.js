/* global beforeEach, afterEach, describe, it, console */

'use strict';

var expect	= require('chai').expect;
var sinon	= require('sinon');
var fs		= require('fs');

var EventModel	= require('../../../dist/models').EventModel;
var ingestQueueMetadata	= require('../../../dist/transforms').ingestQueueMetadata;

var rawSqs = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest', { encoding: 'utf8' }));

describe('Ingest queue metadata', function () {
	
	it('To copy the raw SQS message to the egest message', done => {
		var e = new EventModel(rawSqs);
		ingestQueueMetadata(e);
		expect(e.annotations().ingestSqs.MessageId).to.equal('06eaa235-6712-45da-bae2-1a9ecfd1ce64');
		done();
	});

});
