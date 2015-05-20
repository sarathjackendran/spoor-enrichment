
module.exports = function (headers) {
	return new Promise(function(resolve, reject) {
		resolve({
			country: headers['x-geoip-country'] 
		});
	});
}
