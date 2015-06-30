var es = require('event-stream')

process
	.stdin
	.pipe(es.map(function (data, next) {
		next(null, JSON.stringify(new Buffer(data, { encoding: 'utf8' })))
	}))
	.pipe(process.stdout)              // pipe it to stdout !
