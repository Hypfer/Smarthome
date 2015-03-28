/**
 * Created by hypfer on 10.02.15.
 */

var secrets = require('./secrets.json');
var web = require('./web');
var broadcast = require('./broadcast');
var local = require('./local');
var dect = require('./dect');

var PushBullet = require('pushbullet');
var pusher = new PushBullet(secrets.pbApiKey);

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

    dect.dect(db, pusher, secrets);

    // setup HTTP server
    web._setupWeb(db);
});
