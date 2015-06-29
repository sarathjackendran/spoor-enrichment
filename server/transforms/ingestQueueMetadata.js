module.exports = function (event) {
	
	var meta = {
		MessageId: event.ingest._raw.MessageId, // FIXME - getter? 
		ReceiptHandle: event.ingest._raw.ReceiptHandle,
		MD5OfBody: event.ingest._raw.MD5OfBody,
		timeReceived: event.ingest._asJson.time.received
	}	

	event.annotate('ingestSqs', meta);
	return event;
}
