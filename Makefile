compile:
	gulp compile

run: compile
	@export accessKey=`cat ~/.aws-access.spoor`; \
	 export secretAccessKey=`cat ~/.aws-secret.spoor`; \
	 export SQS_URL=`cat ~/.aws-sqs.spoor`; \
	 node dist/rx.js

test: compile
	@rm -Rf dist-tests/*
	@export SESSION_API_KEY=123; gulp compile-tests; mocha -R spec --recursive dist-tests/server

deploy: compile
	@haikro build deploy --app spoor-sqs-consumer --heroku-token=`heroku auth:token` --commit `git rev-parse HEAD`
