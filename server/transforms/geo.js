
var metrics = require('next-metrics');
var regions = require('../utils/ft-regions');

module.exports = (event) => {
	
	return new Promise((resolve, reject) => {

		if (!process.env.transform_geo && !process.env.mocha) {
			resolve({});
		}

		metrics.count('pipeline.transforms.geo.count', 1);
		
		var headers = event.headers();

		var countryCode3 = headers['x-geoip-country3'];

		var geo = {
			country: headers['x-geoip-country'],
			country3: countryCode3,
			continent: headers['x-geoip-continent'], 
			countryName: headers['x-geoip-country-name'], 
			city: headers['x-geoip-city'], 
			lat: headers['x-geoip-lat'], 
			lon: headers['x-geoip-lon']
		}	

		if (countryCode3) {
			geo['ftRegion'] = regions.get(countryCode3);
		}

		resolve(geo);	
	
	})

}
