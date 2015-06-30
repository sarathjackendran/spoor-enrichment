
Spoor enrichment takes a incoming event (from SQS) and transforms and decorates
it with structured information then pushes it to Kinesis.

The result is a real-time stream of structured information about an event that
has happened in the FT's ecosystem.

## Pipeline

The flow of data,
 
	ingest -> filter -> transform -> egest 

Internally each event is represented by an [event model](server/models/event.js).

The raw SQS message is loaded in to the model then pushed down a [stream](https://nodejs.org/api/stream.html).

Operations to filter and transform the data are piped together, each step
annotating the resulting data structure.

If successful, the event model is pushed on to an egest Kinesis stream and SQS queue.
