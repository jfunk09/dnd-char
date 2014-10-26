var express = require('express');
var app = express();
var mongo = require('mongodb').MongoClient;

app.engine('html', require('ejs-locals'));

app.use(express.static(__dirname + '/app'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

app.get('/', function (req, res) {
	res.render('index.html');
});

app.get('/api/characters', function (req, res) {
	mongo.connect('mongodb://localhost:27017/dndChar', function (err, db) {
		if (err) {
			res.send('error');
			return;
		}
		var characters = db.collection('characters');
		db.close();
		return {some: 'data'};
	});
});

var server = app.listen(9000, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('ex app listening at http://%s:%s', host, port);
});
