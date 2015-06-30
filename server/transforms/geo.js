
module.exports = function (event) {
	
	var headers = event.headers();

	var geo = {
		country: headers['x-geoip-country'],
		continent: headers['x-geoip-continent'], 
		countryName: headers['x-geoip-country-name'], 
		lat: headers['x-geoip-lat'], 
		lon: headers['x-geoip-lon']
	}	

	event.annotate('geo', geo);
	return event;
}
