
'use strict';

var expect	= require('chai').expect;
var sinon	= require('sinon');
var fs		= require('fs');

var geo         = require('../../../dist/transforms').geo;
var EventModel	= require('../../../dist/models').EventModel;

var rawSqs = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest', { encoding: 'utf8' }));
var e;

describe('Geo', () => {

	beforeEach(() => {
		e = new EventModel(rawSqs);
	});

	it('Determine country from the HTTP headers', done => {
		geo(e).then(geo => {
			expect(geo.country).to.equal('GB');
			expect(geo.ftRegion).to.equal('UK');
			done();
		});
	});

});
