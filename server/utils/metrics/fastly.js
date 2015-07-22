
var metrics			= require('next-metrics');

if (!process.env.FASTLY_SERVICE) {
	throw new Error('You must set FASTLY_SERVICE in your environment');
}

if (!process.env.FASTLY_APIKEY) {
	throw new Error('You must set FASTLY_APIKEY in your environment');
}

var serviceId    = process.env.FASTLY_SERVICE;
var fastly       = require('fastly')(process.env.FASTLY_APIKEY, encodeURIComponent(serviceId), { verbose: true });

setInterval(function () {

	console.log('collecting fastly metrics for service', serviceId, encodeURIComponent(serviceId));
    
	fastly
        .stats(serviceId, { 
            from: '5 minutes ago',
            to: '3 minutes ago',
            by: 'minute'
        })
        .then(function (stats) {
			
			console.log(JSON.parse(stats).detail);

            JSON.parse(stats).data.forEach(function (stats) {

				console.log(stats);

                var timestamp = stats.start_time;
                
				var m = new Map([
                    ["header_size"], [stats.header_size],
                    ["body_size"], [stats.body_size],
                    ["requests"], [stats.requests],
                    ["hits"], [stats.hits],
                    ["miss"], [stats.miss],
                    ["uncacheable"], [stats.uncacheable],
                    ["pass"], [stats.pass],
                    ["pipe"], [stats.pipe],
                    ["synth"], [stats.synth],
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

				for (let key of m.keys()) {
                    metrics.count(`fastly.${serviceId}.${key}`, `${m.get(key)} ${timestamp}`);
				}
            
				console.log('Stats logged.');
			});
        })
        .catch(function (err) {
            throw new Error(err); 
        })
        .done();

}, 60000); 
