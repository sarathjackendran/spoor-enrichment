
'use strict';

var expect	= require('chai').expect;
var sinon	= require('sinon');
var fs		= require('fs');

var geo         = require('../../../dist/transforms').geo;
var EventModel	= require('../../../dist/models').EventModel;

var rawSqs = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest', { encoding: 'utf8' }));
var e, g;

describe('Geo', function () {

	beforeEach(() => {
		e = new EventModel(rawSqs);
		g = geo(e);
	});

	it('Determine country from the HTTP headers', done => {
		expect(e.annotations().geo.country).to.equal('GB');
		expect(e.annotations().geo.ftRegion).to.equal('uk');
		done()
	});

});
