
clean:
	@echo "cleaning dist files"
	 rm -Rf dist/*; \
	 rm -Rf dist-tests/*

compile:
	 gulp compile

sqs: compile
	@export accessKey=`cat ~/.aws-access.spoor`; \
	 export secretAccessKey=`cat ~/.aws-secret.spoor`; \
	 export SQS_INGEST=`cat ~/.aws-sqs.spoor-v2`; \
	 export CAPI_API_KEY=`cat ~/.ftapi_v2`; \
	 export SESSION_API_KEY=`cat ~/.session-api`; \
	 node dist/v3.js

test: compile
	@export SESSION_API_KEY=123; \
	 export CAPI_API_KEY=`cat ~/.ftapi_v2`; \
	 export mocha=1; \
	 gulp compile-tests; \
	 mocha -R spec --recursive dist-tests/server;

deploy: compile
	@haikro build deploy --app spoor-sqs-consumer-v002 --heroku-token=`heroku auth:token` --commit `git rev-parse HEAD`

web: compile
	 @nodemon dist/app.js

metrics: compile
	 @export SQS_INGEST=`cat ~/.aws-sqs.spoor-v2`; \
	  export SQS_EGEST=`cat ~/.aws-sqs.spoor-egest-v2`; \
	  export SQS_DEAD_LETTER=`cat ~/.aws-sqs.spoor-dead-letter`; \
	  export accessKey=`cat ~/.aws-access.spoor`; \
	  export secretAccessKey=`cat ~/.aws-secret.spoor`; \
	  nodemon dist/metrics.js
