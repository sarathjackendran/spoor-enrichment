/* global beforeEach, afterEach, describe, it, console */

'use strict';

var expect	= require('chai').expect;
var sinon	= require('sinon');

var toJson	= require('../../../dist/transforms').toJson;

describe('to JSON', function () {
	
	it('to JSON', done => {
		expect(toJson('{"a":"b"}').a).to.equal('b');
		done();
	});
	
	it('Do not barf on receiving invalid JSON', done => {
		expect(toJson('{"a":....}')).to.deep.equal({});
		done();
	});

});
