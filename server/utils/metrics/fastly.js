
var metrics			= require('next-metrics');

var serviceId    = process.env.fastly_service;
var fastly       = require('fastly')(process.env.fastly_apikey, encodeURIComponent(serviceId), { verbose: true });

module.exports = function (graphite) {

    fastly
        .stats({ 
            from: '5 minutes ago',
            to: '3 minutes ago',
            by: 'minute'
        })
        .then(function (stats) {
            
            JSON.parse(stats).data.forEach(function (stats) {

				console.log(stats);

                var timestamp = stats.start_time;
                
				var metrics = new Map([
                    ["header_size"], [stats.header_size],
                    ["body_size"], [stats.body_size],
                    ["requests"], [stats.requests],
                    ["hits"], [stats.hits],
                    ["miss"], [stats.miss],
                    ["uncacheable"], [stats.uncacheable],
                    ["pass"], [stats.pass],
                    ["pipe"], [stats.pipe],
                    ["synth"], [stats.synth],
                    ["hits_time"], [stats.hits_time],
                    ["miss_time"], [stats.miss_time],
                    ["status_1xx"], [stats.status_1xx],
                    ["status_2xx"], [stats.status_2xx],
                    ["status_3xx"], [stats.status_3xx],
                    ["status_4xx"], [stats.status_4xx],
                    ["status_5xx"], [stats.status_5xx],
                    ["status_200"], [stats.status_200],
                    ["status_204"], [stats.status_204],
                    ["status_301"], [stats.status_301],
                    ["status_302"], [stats.status_302],
                    ["status_304"], [stats.status_304],
                    ["status_503"], [stats.status_503],
                    ["bandwidth"], [stats.bandwith],
                    ["errors"], [stats.errors]
				]);

                metricsWithTimeStamp = metrics.forEach((value, key) => {
                    metrics.count(`fastly.${serviceId}`, `${value} ${timestamp}`);
                })
            
			});
        })
        .then(function (res) { 
            debug('Stats logged.');
        })
        .catch(function (err) {
            throw new Error(err); 
        })
        .done();

};

