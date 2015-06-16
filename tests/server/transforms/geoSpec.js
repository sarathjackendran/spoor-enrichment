
'use strict';

var expect	= require('chai').expect;
var sinon	= require('sinon');
var fs		= require('fs');

var geo		= require('../../../dist/transforms').geo;
var e = {
	ingest: JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest', { encoding: 'utf8' })),
	egest: {}
}

e.ingest.BodyAsJson = JSON.parse(e.ingest.Body);
//console.log(e.ingest.Body)

describe('Geo', function () {

	beforeEach(() => {
		e.egest = {
			user: { }
		};
	})

	it('Determine country from the HTTP headers', done => {
		expect(geo(e).egest.user.geo.country).to.equal('GB');
		done()
	});

});
