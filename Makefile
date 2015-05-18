HEROKU_AUTH_TOKEN := `heroku auth:token`

run:
	@export accessKey=`cat ~/.aws-access.spoor`; \
	 export secretAccessKey=`cat ~/.aws-secret.spoor`; \
	 export SQS_URL=`cat ~/.aws-sqs.spoor`; \
	 node index.js
