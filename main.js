/**
 * Created by hypfer on 10.02.15.
 */
var web = require('./web');
var broadcast = require('./broadcast');
var local = require('./local');
var dect = require('./dect');

var MongoClient = require('mongodb').MongoClient;

var db, url = 'mongodb://localhost:27017/homecontrol';

MongoClient.connect(url, function(err, _db) {
    if (err) throw err;

    db = _db;

    console.log("Connected to MongoDB.");

    // setup UDP server
    broadcast._setupBroadcastListener(db);

    // setup airsensor polling
    local.local(db);

    dect.dect(db);

    // setup HTTP server
    web._setupWeb(db);
});
