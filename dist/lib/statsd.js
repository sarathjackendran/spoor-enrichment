'use strict';

var util = require('util');

// Derive the keys based on the platform, Eg, <platform>.<application>.<instance>.<metric>
var prefix = process.env.HOSTEDGRAPHITE_APIKEY;
var platform = process.env.DYNO ? 'heroku' : 'localhost';
var instance = platform === 'heroku' ? process.env.DYNO.replace('.', '_') : '_';
var app = 'spoor-api';

var key = util.format('%s.%s.%s.%s.', prefix, platform, app, instance);

var StatsD = require('node-statsd'),
    client = new StatsD({
				host: 'statsd.hostedgraphite.com',
				port: 8125,
				prefix: key
});

module.exports = client;