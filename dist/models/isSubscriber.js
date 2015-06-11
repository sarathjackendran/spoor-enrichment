"use strict";

module.exports = function (cookie) {
	var subscriber = /FTSession/i;
	return new Promise(function (resolve, reject) {
		resolve({
			isSubscriber: subscriber.test(cookie)
		});
	});
};