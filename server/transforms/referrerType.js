var fetch = require('node-fetch');
var contentLength = 0;
var prevContentLength = 0;
var referrersUrl = "https://gist.githubusercontent.com/commuterjoy/492584626f1dd4a85509/raw/32eb52b6902be600efaa097ac24b3da1a06cb006/gistfile1.txt";
var referrers = [];
var getReferrerData = getReferrerData(referrer) => {
	//Check the remote file's header for any change in file
	return fetch(referrersUrl, {method:"HEAD"}).then((res) => {
		if (res.status !== 200) {
			console.log('status was not a 200(Method:Head)');
			return;
		}
		prevContentLength = contentLength;
		contentLength = res.headers.get('content-length');
	}).then(() => {
		//If file changed read it and store in variable
		if((contentLength != prevContentLength) || (prevContentLength == 0)) {
			return fetch(referrersUrl)
				.then((res) => {
					if (res.status !== 200) {
						console.log('status was not a 200(Method:GET)');
						return;
					}
					return res.text();
				}).then((body) => {
					var result = (body)?body.split('\n'):[];
					for(x in result) {
						items = result[x].split(',');
						referrers[items[0]]= items[1];
					}
					return referrers;
				});
			} else if(prevContentLength != 0){
				return referrers;				//return previous referrers list as file is not changed
			}
		}).then((referrers) => {
			//If referrer found move the referrer to the top of the array.
			if(referrers[referrer]) {
				referrers.splice(referrer,1);
				referrers.unshift(referrer);
				return referrers[referrer];
			}
			return "Direct";
		});
}

'use strict';
module.exports = (event) => {
	var referrer = event.pluck('context.referrer') || event.headers().referer;
	return new Promise((resolve,reject) => {
		var referrerType = getReferrerData(referrer);
		resolve(referrerType);
	}).then((referrerType) => {
		return Promise.resolve({referrerType:referrerType});
	});
};
