'use strict';

var dgram = require('dgram');
module.exports = {
    _setupBroadcastListener: function (db, agenda, settings) {

        var socket = dgram.createSocket('udp4');

        console.log('Starting broadcast Listener..');

        socket.on('listening', function() {
            var address = socket.address();
            console.log('Broadcast listening on ' + address.address + ':' + address.port);
        });

        socket.on('message', function(message) {
            var receivedMessage = message.toString().split('|');

            var collection = db.collection('readings_' + receivedMessage[0]);
            receivedMessage[1] = parseFloat(receivedMessage[1]);
            //TODO: Aktuelle Spannung messen
            receivedMessage[1] = receivedMessage[0] === 'EMON' ? (receivedMessage[1] * 223) : receivedMessage[1];
            receivedMessage[1] = parseFloat(receivedMessage[1].toFixed(2)); // The fuck, javascript
            collection.insert([{
                    v: receivedMessage[1],
                    ts: new Date()
                }], function (err) {
                    if (err) {
                        agenda.now('handleEvent', {
                            ts: new Date(),
                            severity: 'danger',
                            type: 'GeneralError',
                            emitter: 'ERROR',
                            detail: err
                        });
                    } else {
                        db.collection('Sensors').findOne({sensorID: receivedMessage[0]}, function (err, doc) {
                            if (err) {
                                agenda.now('handleEvent', {
                                    ts: new Date(),
                                    severity: 'danger',
                                    type: 'GeneralError',
                                    emitter: 'ERROR',
                                    detail: err
                                });
                            } else {
                                if (doc) {
                                    if (doc.limits) {
                                        if (doc.limits[0] && (receivedMessage[1] < doc.limits[0])) {
                                            agenda.now('handleEvent', {
                                                ts: new Date(),
                                                severity: 'warning',
                                                type: 'SensorOutOfBounds',
                                                emitter: doc.name,
                                                detail: receivedMessage[1] + ' is less than ' + doc.limits[0]
                                            });
                                        } else if (doc.limits[1] && (receivedMessage[1] > doc.limits[1])) {
                                            agenda.now('handleEvent', {
                                                ts: new Date(),
                                                severity: 'warning',
                                                type: 'SensorOutOfBounds',
                                                emitter: doc.name,
                                                detail: receivedMessage[1] + ' is more than ' + doc.limits[1]
                                            });
                                        }
                                    }
                                    var avg = doc.allTimeAVG ? (doc.allTimeAVG + receivedMessage[1]) / 2 : receivedMessage[1];
                                    db.collection('Sensors').update({sensorID: receivedMessage[0]},
                                        {
                                            $set: {
                                                lastReading: receivedMessage[1],
                                                allTimeAVG: avg
                                            }
                                        }, function (err) {
                                            if (err) {
                                                agenda.now('handleEvent', {
                                                    ts: new Date(),
                                                    severity: 'danger',
                                                    type: 'GeneralError',
                                                    emitter: 'ERROR',
                                                    detail: err
                                                });
                                            }
                                        });
                                }
                            }
                        });
                    }
                }
            );

        });

        socket.bind(settings.udpListener.port, settings.udpListener.ip, function () {
            socket.setBroadcast(true);
        });

        socket.on('error', function () {
            console.log('Error. Restarting server..');
            process.nextTick(_setupBroadcastListener);
        });
    }
};