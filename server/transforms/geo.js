
module.exports = function (event) {
	
	var headers = event.ingest.BodyAsJson.envelope.headers;

	event.egest.user.geo = {
		country: headers['x-geoip-country'], 
		continent: headers['x-geoip-continent'], 
		countryName: headers['x-geoip-country'], 
		lat: headers['x-geoip-lat'], 
		lon: headers['x-geoip-lon']
	}	

	return event;
}
