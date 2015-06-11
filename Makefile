compile:
	gulp compile

run: compile
	@export accessKey=`cat ~/.aws-access.spoor`; \
	 export secretAccessKey=`cat ~/.aws-secret.spoor`; \
	 export SQS_URL=`cat ~/.aws-sqs.spoor`; \
	 node dist/consumer.js

test:
	echo "TODO"

deploy: compile
	@haikro build deploy --app spoor-sqs-consumer --heroku-token=`heroku auth:token` --commit `git rev-parse HEAD`
