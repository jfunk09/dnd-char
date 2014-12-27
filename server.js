var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash-node');
var app = express();
var mongo = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var Binary = require('mongodb').Binary;
var Character = require('./lib/character.js');
var Spell = require('./lib/spell.js');
var Item = require('./lib/item.js');

app.engine('html', require('ejs-locals'));
app.set('view engine', 'html');

app.use(express.static(__dirname + '/app'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/partials', express.static(__dirname + '/views/partials'));
app.use('/styles', express.static(__dirname + '/styles'));
app.use('/images', express.static(__dirname + '/images'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var dbUrl = 'mongodb://localhost:27017/dndChar';

// Character API
app.get('/api/getCharacter', function (req, res) {
	mongo.connect(dbUrl, function (err, db) {
		if (err) {
			db.close();
			res.send('error connecting');
			return;
		}
		var cc = db.collection('characters');
		var id = null;
		try {
			id = ObjectID.createFromHexString(req.query.id);
			cc.findOne({_id: id}, function (err, result) {
				if (err) {
					db.close();
					res.send('error finding');
					return;
				}
				db.close();
				res.send(new Character(result));
			});
		} catch (e) {
			db.close();
			res.send('error try/catch');
		}
	});
});

app.get('/api/characters', function (req, res) {
	mongo.connect(dbUrl, function (err, db) {
		if (err) {
			db.close();
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
			db.close();
			res.send(characters);
		});
	});
});

app.get('/api/deleteCharacter', function (req, res) {
	mongo.connect(dbUrl, function (err, db) {
		if (err) {
			db.close();
			res.send('error connecting');
			return;
		}
		var cc = db.collection('characters');
		var id = null;
		try {
			id = ObjectID.createFromHexString(req.query.id);
			cc.remove({_id: id}, function (err) {
				if (err) {
					db.close();
					res.send('error removing');
					return;
				}
				db.close();
				res.sendStatus(200);
			});
		} catch (e) {
			db.close();
			res.send('error try/catch');
		}
	});
});

app.post('/api/addCharacter', function (req, res) {
	var character = new Character(req.body);
	mongo.connect(dbUrl, function (err, db) {
		if (err) {
			db.close();
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

app.post('/api/updateCharacter', function (req, res) {
	var params = req.body.params;
	if (_.isEmpty(params)) {
		res.sendStatus(200);
		return;
	}
	mongo.connect(dbUrl, function (err, db) {
		if (err) {
			db.close();
			res.send('error');
			return;
		}
		var cc = db.collection('characters');

		var id = null;
		try {
			id = ObjectID.createFromHexString(req.body.dbID);
		} catch (e) {
			db.close();
			res.send('error try/catch');
			return;
		}

		cc.update({_id: id}, {$set: params}, {w:1}, function (err, result) {
			if(err) {
				console.log('error updating:', err);
				db.close();
				res.send('update error');
			}
			db.close();
			res.sendStatus(200);
		});
	});
});

// Spell API
app.get('/api/getSpell', function (req, res) {
	mongo.connect(dbUrl, function (err, db) {
		if (err) {
			db.close();
			res.send('error connecting');
			return;
		}
		var sc = db.collection('spells');
		var id = null;
		try {
			id = ObjectID.createFromHexString(req.query.id);
			sc.findOne({_id: id}, function (err, result) {
				if (err) {
					db.close();
					res.send('error finding');
					return;
				}
				db.close();
				res.send(new Spell(result));
			});
		} catch (e) {
			db.close();
			res.send('error try/catch');
		}
	});
});

app.get('/api/allSpells', function (req, res) {
	mongo.connect(dbUrl, function (err, db) {
		if (err) {
			db.close();
			res.send('error');
			return;
		}
		var sc = db.collection('spells');
		var spells = [];

		var stream = sc.find().stream();
		stream.on('data', function (data) {
			var spell = new Spell(data);
			spells.push(spell.toJSON());
		});
		stream.on('end', function () {
			db.close();
			res.send(spells);
		});
	});
});

app.get('/api/deleteSpell', function (req, res) {
	mongo.connect(dbUrl, function (err, db) {
		if (err) {
			db.close();
			res.send('error connecting');
			return;
		}
		var sc = db.collection('spells');
		var id = null;
		try {
			id = ObjectID.createFromHexString(req.query.id);
			sc.remove({_id: id}, function (err) {
				if (err) {
					db.close();
					res.send('error removing');
					return;
				}
				db.close();
				res.sendStatus(200);
			});
		} catch (e) {
			db.close();
			res.send('error try/catch');
		}
	});
});

app.post('/api/addSpell', function (req, res) {
	var spell = new Spell(req.body);
	mongo.connect(dbUrl, function (err, db) {
		if (err) {
			db.close();
			res.send('error');
			return;
		}
		var sc = db.collection('spells');
		sc.insert(spell.toJSON(), {w:1}, function (err, result) {
			console.log('Insert Spell', result);
			db.close();
			res.sendStatus(200);
		});
	});
});

app.post('/api/updateSpell', function (req, res) {
	var params = req.body.params;
	if (_.isEmpty(params)) {
		res.sendStatus(200);
		return;
	}
	mongo.connect(dbUrl, function (err, db) {
		if (err) {
			db.close();
			res.send('error');
			return;
		}
		var sc = db.collection('spells');

		var id = null;
		try {
			id = ObjectID.createFromHexString(req.body.dbID);
		} catch (e) {
			db.close();
			res.send('error try/catch');
			return;
		}

		sc.update({_id: id}, {$set: params}, {w:1}, function (err, result) {
			if(err) {
				console.log('error updating:', err);
				db.close();
				res.send('update error');
			}
			db.close();
			res.sendStatus(200);
		});
	});
});

// Item API
app.get('/api/getItem', function (req, res) {
	mongo.connect(dbUrl, function (err, db) {
		if (err) {
			db.close();
			res.send('error connecting');
			return;
		}
		var ic = db.collection('items');
		var id = null;
		try {
			id = ObjectID.createFromHexString(req.query.id);
			ic.findOne({_id: id}, function (err, result) {
				if (err) {
					db.close();
					res.send('error finding');
					return;
				}
				db.close();
				res.send(new Item(result));
			});
		} catch (e) {
			db.close();
			res.send('error try/catch');
		}
	});
});

app.get('/api/allItems', function (req, res) {
	mongo.connect(dbUrl, function (err, db) {
		if (err) {
			db.close();
			res.send('error');
			return;
		}
		var ic = db.collection('items');
		var items = [];

		var stream = ic.find().stream();
		stream.on('data', function (data) {
			var item = new Item(data);
			items.push(item.toJSON());
		});
		stream.on('end', function () {
			db.close();
			res.send(items);
		});
	});
});

app.get('/api/deleteItem', function (req, res) {
	mongo.connect(dbUrl, function (err, db) {
		if (err) {
			db.close();
			res.send('error connecting');
			return;
		}
		var ic = db.collection('items');
		var id = null;
		try {
			id = ObjectID.createFromHexString(req.query.id);
			ic.remove({_id: id}, function (err) {
				if (err) {
					db.close();
					res.send('error removing');
					return;
				}
				db.close();
				res.sendStatus(200);
			});
		} catch (e) {
			db.close();
			res.send('error try/catch');
		}
	});
});

app.post('/api/addItem', function (req, res) {
	var item = new Item(req.body);
	mongo.connect(dbUrl, function (err, db) {
		if (err) {
			db.close();
			res.send('error');
			return;
		}
		var ic = db.collection('items');
		ic.insert(item.toJSON(), {w:1}, function (err, result) {
			console.log('Insert Item', result);
			db.close();
			res.sendStatus(200);
		});
	});
});

app.post('/api/updateItem', function (req, res) {
	var params = req.body.params;
	if (_.isEmpty(params)) {
		res.sendStatus(200);
		return;
	}
	mongo.connect(dbUrl, function (err, db) {
		if (err) {
			db.close();
			res.send('error');
			return;
		}
		var ic = db.collection('items');

		var id = null;
		try {
			id = ObjectID.createFromHexString(req.body.dbID);
		} catch (e) {
			db.close();
			res.send('error try/catch');
			return;
		}

		ic.update({_id: id}, {$set: params}, {w:1}, function (err, result) {
			if(err) {
				console.log('error updating:', err);
				db.close();
				res.send('update error');
			}
			db.close();
			res.sendStatus(200);
		});
	});
});

// Other Stuff
app.get('/*', function (req, res) {
    res.sendFile('views/index.html', { root: __dirname });
});

var server = app.listen(9000, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('ex app listening at http://%s:%s', host, port);
});
