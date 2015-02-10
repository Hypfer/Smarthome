/**
 * Created by hypfer on 10.02.15.
 */
var dgram = require('dgram');

var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

var socket, db;

var _setupClient = function () {
    socket = dgram.createSocket("udp4");

    console.log("Starting server..");

    socket.on('listening', function() {
        var address = socket.address();
        console.log('UDP Server listening on ' + address.address + ":" + address.port);
    });

    socket.on('message', function(message) {
        receivedMessage = message.toString().split("|");
        console.log(message.toString());
        var collection = db.collection(receivedMessage[0]);

        collection.insert([{
            v1: receivedMessage[1],
            v2: receivedMessage[2],
            ts: new Date().toISOString()
        }], function(err) {
                assert.equal(err, null);
            }

        );
    });

    socket.bind(55655, "192.168.227.255", function() {
        socket.setBroadcast(true)
    });

    socket.on('error', function () {
        console.log("Error. Restarting server..");
        process.nextTick(_setupClient);
    })
};

var url = 'mongodb://localhost:27017/homecontrol';
MongoClient.connect(url, function(err, _db) {
    assert.equal(null, err);

    db = _db;

    console.log("Connected to MongoDB.");

    _setupClient ();
});
