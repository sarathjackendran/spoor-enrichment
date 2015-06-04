HEROKU_AUTH_TOKEN := `heroku auth:token`

compile:
	gulp compile

run: compile
	@export accessKey=`cat ~/.aws-access.spoor`; \
	 export secretAccessKey=`cat ~/.aws-secret.spoor`; \
	 export SQS_URL=`cat ~/.aws-sqs.spoor`; \
	 node dist/consumer.js
