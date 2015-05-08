"use strict";

var secrets = require('./secrets.json');
var web = require('./web');
var broadcast = require('./broadcast');
var jobs = require('./jobs');
var dect = require('./dect');

var Agenda = require('agenda'),
    agenda = new Agenda({
        name: 'Name',
        db: {
            address: 'localhost:27017/homecontrol'
        }
    });

//unlock stuck jobs
agenda._db.update({lockedAt: {$exists: true}}, {$set: {lockedAt: null}}, function (e, numUnlocked) {
    if (e) {
        throw e;
    }
    console.log("Unlocked " + numUnlocked + " jobs.");
});

var PushBullet = require('pushbullet');
var pusher = new PushBullet(secrets.pbApiKey);

var MongoClient = require('mongodb').MongoClient;

var db, url = 'mongodb://localhost:27017/homecontrol';

MongoClient.connect(url, function(err, _db) {
    if (err) {
        throw err;
    }

    db = _db;

    console.log("Connected to MongoDB.");

    agenda.start();

    // setup jobHandler
    jobs.jobs(db, pusher, agenda, secrets);

    // setup UDP listener
    broadcast._setupBroadcastListener(db, agenda);

    // setup gigaset connection
    dect.dect(agenda);

    // setup HTTP server
    web._setupWeb(db);
});
