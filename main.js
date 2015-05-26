'use strict';

var settings = require('./settings.json');
var web = require('./web');
var broadcast = require('./broadcast');
var jobs = require('./jobs');
if (settings.gigaset.active) {
    var dect = require('./dect');
}

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
    console.log('Unlocked ' + numUnlocked + ' jobs.');
});

var PushBullet = require('pushbullet'), pusher;

if (settings.pushbullet) {
    pusher = new PushBullet(settings.pushbullet.apiKey);
}

var MongoClient = require('mongodb').MongoClient;

var db, url = 'mongodb://' + settings.mongodb.host +
    ':' + settings.mongodb.port + '/' +
    settings.mongodb.db;

MongoClient.connect(url, function(err, _db) {
    if (err) {
        throw err;
    }

    db = _db;

    console.log('Connected to MongoDB.');

    agenda.start();

    // setup jobHandler
    jobs.jobs(db, pusher, agenda, settings);

    if (settings.udpListener.active) {
        // setup UDP listener
        broadcast._setupBroadcastListener(db, agenda, settings);
    }

    if (settings.gigaset.active) {
        // setup gigaset connection
        dect.dect(agenda);
    }

    if (settings.webserver.active) {
        // setup HTTP server
        web._setupWeb(db, settings);
    }
});
