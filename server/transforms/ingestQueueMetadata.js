module.exports = function (event) {
	
	var meta = {
		MessageId: event.ingest._raw.MessageId, 
		ReceiptHandle: event.ingest._raw.ReceiptHandle,
		MD5OfBody: event.ingest._raw.MD5OfBody
	}	

	event.annotate('ingestSqs', meta);
	return event;
}
