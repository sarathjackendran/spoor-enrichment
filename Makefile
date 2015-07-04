
clean:
	@echo "cleaning dist files"
	 rm -Rf dist/*; \
	 rm -Rf dist-tests/*

compile:
	 gulp compile

run: compile
	@export accessKey=`cat ~/.aws-access.spoor`; \
	 export secretAccessKey=`cat ~/.aws-secret.spoor`; \
	 export SQS_INGEST=`cat ~/.aws-sqs.spoor-v2`; \
	 export CAPI_API_KEY=`cat ~/.ftapi_v2`; \
	 export SESSION_API_KEY=`cat ~/.session-api`; \
	 node dist/stream.js

test: compile
	@export SESSION_API_KEY=123; \
	 export CAPI_API_KEY=`cat ~/.ftapi_v2`; \
	 export transform_session=1; \
	 export transform_capi=1; \
	 export transform_ab=1; \
	 gulp compile-tests; \
	 mocha -R spec --recursive dist-tests/server;

deploy: compile
	@haikro build deploy --app spoor-sqs-consumer-v002 --heroku-token=`heroku auth:token` --commit `git rev-parse HEAD`

