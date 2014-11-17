var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var mongo = require('mongodb').MongoClient;
var Character = require('./lib/character.js');

app.engine('html', require('ejs-locals'));
app.set('view engine', 'html');

app.use(express.static(__dirname + '/app'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/partials', express.static(__dirname + '/views/partials'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var dbUrl = 'mongodb://localhost:27017/dndChar';

app.get('/api/characters', function (req, res) {
	mongo.connect(dbUrl, function (err, db) {
		if (err) {
			res.send('error');
			return;
		}
		var charactersCollection = db.collection('characters');
		var characters = [];
		
		var stream = charactersCollection.find().stream();
		stream.on('data', function (data) {
			var character = new Character(data);
			characters.push(character.toJSON());
		});
		stream.on('end', function () {
			res.send(characters);
			db.close();
		});
	});
});

app.post('/api/addCharacter', function (req, res) {
	var character = new Character(req.body);
	mongo.connect(dbUrl, function (err, db) {
		if (err) {
			res.send('error');
			return;
		}
		var cc = db.collection('characters');
		cc.insert(character.toJSON(), {w:1}, function (err, result) {
			console.log('Insert Character', result);
			db.close();
			res.sendStatus(200);
		});
	});
});

app.get('/api/update', function (req, res) {
	mongo.connect(dbUrl, function (err, db) {
		if (err) {
			res.send('error');
			return;
		}
		res.sendStatus(200);
		var cc = db.collection('characters');
		/*cc.insert({name: 'jeffers'}, {w:1}, function (err, result) {
			console.log('insert result', result);
			db.close();
			res.sendStatus(200);
		});
		
		var stream = cc.find({race:'human'}).stream();
		stream.on('data', function (character) {
			cc.remove(character, {w:1}, function () {});
		});
		stream.on('end', function () {
			db.close();
			res.sendStatus(200);
		});
		
		/*cc.update({name:'jeffers'}, {$set:{race: 'human'}}, {w:1}, function (err, result) {
			console.log('update result', result);
			db.close();
			res.sendStatus(200);
		});*/
	});
});

app.get('/*', function (req, res) {
    res.sendFile('views/index.html', { root: __dirname });
});

var server = app.listen(9000, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('ex app listening at http://%s:%s', host, port);
});
