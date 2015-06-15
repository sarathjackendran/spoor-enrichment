/* global beforeEach, afterEach, describe, it, console */

'use strict';

var expect			= require('chai').expect;
var sinon			= require('sinon');

var isValidSource	= require('../../../dist/filters').isValidSource;

describe('Source', function () {
	
	it('Must specify the source of the event', done => {
		expect( isValidSource({ }) ).to.be.false;
		done();
	});
	
	it('Must specify the type of event', done => {
		expect( isValidSource({ event: { source: "123", action: "123" } }) ).to.be.true;
		done();
	});

});
