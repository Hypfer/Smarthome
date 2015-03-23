/**
 * Created by hypfer on 11.02.15.
 */
var dgram = require('dgram');
var assert = require('assert');
module.exports = {
    _setupBroadcastListener: function(db) {

        var socket = dgram.createSocket("udp4");

        console.log("Starting broadcast Listener..");

        socket.on('listening', function() {
            var address = socket.address();
            console.log('Broadcast listening on ' + address.address + ":" + address.port);
        });

        socket.on('message', function(message) {
            receivedMessage = message.toString().split("|");
            //console.log(message.toString());
            if(receivedMessage[0] == "EVENT") {
                console.log(message.toString());
            } else {
                var collection = db.collection(receivedMessage[0]);

                collection.insert([{
                        v: parseFloat(receivedMessage[1]),
                        ts: new Date()
                    }], function (err) {
                        //TODO: Remove assert
                        assert.equal(err, null);
                    }
                );
            }
        });

        socket.bind(55655, "192.168.227.255", function() {
            socket.setBroadcast(true)
        });

        socket.on('error', function () {
            console.log("Error. Restarting server..");
            process.nextTick(_setupClient);
        })
    }
};