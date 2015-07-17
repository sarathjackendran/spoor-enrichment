var metrics = require('next-metrics');

module.exports = function (event) {
		
	metrics.count('pipeline.transforms.ingestQueueMetadata.count', 1);
	
	return new Promise((resolve, reject) => {
		
		if (!process.env.transform_ingest) {
			resolve({});
		}
		
		var meta = {
			MessageId: event.ingest._raw.MessageId, // FIXME - getter? 
			ReceiptHandle: event.ingest._raw.ReceiptHandle,
			MD5OfBody: event.ingest._raw.MD5OfBody,
			timeReceived: event.received().toISOString()
		}	
		resolve(meta);	
	})
}
