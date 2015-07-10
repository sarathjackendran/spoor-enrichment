
var metrics = require('next-metrics');

module.exports = function (event) {
	
	metrics.count('pipeline.transforms.geo.count', 1);
	
	var headers = event.headers();

	var geo = {
		country: headers['x-geoip-country'],
		continent: headers['x-geoip-continent'], 
		countryName: headers['x-geoip-country-name'], 
		city: headers['x-geoip-city'], 
		lat: headers['x-geoip-lat'], 
		lon: headers['x-geoip-lon']
	}	

	event.annotate('geo', geo);
	return event;
}
