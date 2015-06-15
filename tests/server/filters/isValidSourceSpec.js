/* global beforeEach, afterEach, describe, it, console */

'use strict';

var expect	= require('chai').expect;
var sinon	= require('sinon');

var source	= require('../../../dist/filters/isValidSource');

describe('Source', function () {
	
	it('Must specify the source of the event', done => {
		expect( source({ }) ).to.be.false;
		done();
	});
	
	it('Must specify the type of event', done => {
		expect( source({ event: { source: "123", action: "123" } }) ).to.be.true;
		done();
	});

});
