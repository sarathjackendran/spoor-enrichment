module.exports = function (cookie) {
	return new Promise(function(resolve, reject) {

		if (!cookie) resolve(undefined);

		var match = cookie.match(/FTSESSION=([^;]+)/i);
		var session = (match) ? match[1] : undefined;

		resolve(session);
	});
}
