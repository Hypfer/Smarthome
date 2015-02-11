/**
 * Created by hypfer on 10.02.15.
 */
var web = require('./web');
var broadcast = require('./broadcast');
var local = require('./local');

var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');



var db;
var url = 'mongodb://localhost:27017/homecontrol';


MongoClient.connect(url, function(err, _db) {
    assert.equal(null, err);

    db = _db;

    console.log("Connected to MongoDB.");

    broadcast._setupBroadcastListener(db);
    local.local(db);
    web._setupWeb(db);
});
