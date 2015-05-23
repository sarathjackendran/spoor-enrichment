
var redis = require('then-redis');

var redisgreen = require("url").parse(process.env.REDISGREEN_URL);

console.log(redisgreen);

var db = redis.createClient({ port: redisgreen.port, host: redisgreen.hostname, password: redisgreen.auth.split(":")[1] });

module.exports = function (referrer) {
	

	if (!referrer && !referrer.pathname) return;

	console.log('Writing message to Redis', referrer.pathname);

	db.incrby(referrer.pathname, 1);

};
