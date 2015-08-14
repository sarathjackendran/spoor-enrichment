var express = require('express');
var app = express();
var fs = require('fs');

app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'jade');

app.get('/', require('./controllers/flags')); 
app.get('/__health', require('./controllers/health')); 

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});
