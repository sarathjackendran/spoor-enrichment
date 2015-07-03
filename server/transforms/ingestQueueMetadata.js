var metrics = require('next-metrics');

module.exports = function (event) {
		
	metrics.count('pipeline.transforms.ingestQueueMetadata.count', 1);
	
	var meta = {
		MessageId: event.ingest._raw.MessageId, // FIXME - getter? 
		ReceiptHandle: event.ingest._raw.ReceiptHandle,
		MD5OfBody: event.ingest._raw.MD5OfBody,
		timeReceived: event.received().toISOString()
	}	

	event.annotate('ingestSqs', meta);
	return event;
}
