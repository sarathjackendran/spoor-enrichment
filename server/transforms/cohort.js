
var fetch	= require('node-fetch');
var metrics = require('next-metrics');
var cohorts = require('../utils/ft-cohorts');

module.exports = (event) => {
	
	return new Promise((resolve, reject) => {
		
		if (!process.env.transform_cohort && !process.env.mocha) {
			resolve({});
		}

		var cohort = [];
		metrics.count('pipeline.transforms.cohort.count', 1);
		var cookie = event.headers().cookie;
		if (cookie) {

			// PRODUCTS=_P1_P0_Tools_
			var match = cookie.match(/PRODUCTS=_([^:]+)/);
			
			if (match) {
				var products = match[1].split('_');
				cohort = products
					.map((product) => {
						return cohorts.get(product)
					})
					.filter((cohort) => {	// remove unknown products
						return cohort;
					});
			}
		}

		console.log('transforms/cohort', cohort);
		resolve(cohort);
	});
}
