var express = require('express');
var app = express();

app.engine('html', require('ejs-locals'));

app.use(express.static(__dirname + '/app'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

app.get('/', function (req, res) {
	res.render('index.html');
});

var server = app.listen(9000, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('ex app listening at http://%s:%s', host, port);
});
