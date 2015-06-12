'use strict';
var express = require('express'),
    hbs = require('hbs'),
    bodyParser = require('body-parser'),
    _ = require('underscore'),
    url = require('url'),
    ObjectID = require('mongodb').ObjectID;

var averageChunk = function (data, chunkSize, callback) {
    if (chunkSize > 1) {
        chunkSize = chunkSize > 2 ? chunkSize : chunkSize + 1;
        var slimData = [];
        var avgTS = 0,
            avgV = 0,
            iterator = 0;
        data.forEach(function (dataPoint) {
            avgTS += dataPoint[0]; //timestamp
            avgV += dataPoint[1]; //value
            iterator++;
            if (iterator >= chunkSize) {
                slimData.push([Math.floor(avgTS / iterator), avgV / iterator]);
                avgTS = 0;
                avgV = 0;
                iterator = 0;
            }
        });
        if (iterator > 0) {
            slimData.push([Math.floor(avgTS / iterator), avgV / iterator]);
        }
        callback(slimData);

    } else {
        callback(data);
    }
};

module.exports = {
    _setupWeb: function (db, settings) {
        console.log('Starting Webserver...');

        var app = express();
        app.set('view engine', 'hbs');

        console.log(__dirname);
        app.use(express.static(__dirname + '/res'));

        app.use(bodyParser.json()); // to support JSON-encoded bodies
        app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
            extended: true
        }));

        // CORS (Cross-Origin Resource Sharing) headers to support Cross-site HTTP requests
        app.all('*', function (req, res, next) {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'X-Requested-With');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            next();
        });

        app.delete('/api/events', function (req, res) {
            try {
                var eventID = new ObjectID(req.body._id);
                db.collection('EVENTS').remove({_id: eventID}, function (err, result) {
                    res.send('OK');
                });
            } catch (err) {
                res.status(500).json(err);
            }
        });

        app.get('/api/main', function (req, res) {
            db.collection('Sensors').find().toArray(function (err, sensors) {
                if (err) {
                    return res.status(500).json(err);
                }
                db.collection('EVENTS').find().toArray(function (err, events) {
                    if (err) {
                        return res.status(500).json(err);
                    }
                    res.json({
                        sensors: sensors,
                        events: events
                    });
                });
            });
        });

        app.get('/', function (req, res) {

            res.sendFile('res/index.html', {root: __dirname});

        });

        app.get('/api/sensors/:id', function (req, res) {
            var collection = db.collection('readings_' + req.params.id);
            var minutes = req.query.minutes || 30;
            var chunkSize = Math.floor(minutes / 100);
            if (chunkSize > 10) {
                chunkSize = 10;
            }

            collection.find({
                ts: {
                    $gt: new Date(new Date() - 1000 * 60 * minutes)
                }
            }).toArray(function (err, docs) {
                if (err) {
                    return res.status(500).json(err);
                }

                var returnArray = [];
                docs.forEach(function (doc) {
                    returnArray.push([
                        doc.ts.getTime(),
                        doc.v
                    ]);
                });

                var sortfunc = function (a, b) {
                    return a[0] - b[0];
                };
                averageChunk(returnArray.sort(sortfunc), chunkSize, function (data) {
                    res.json(data);
                });
            });
        });

        app.get('/api/settings', function (req, res) {
            db.collectionNames(function (err, collectionList) {
                if (err) {
                    return res.status(500).json(err);
                }

                var sensorsWithData = [];
                var i;
                for (i = 0; i < collectionList.length; i++) { // no forEach because mongo hates me
                    if (collectionList[i].name.indexOf('readings_') !== -1) {
                        sensorsWithData.push(collectionList[i].name.split('readings_')[1]);
                    }
                }
                var collection = db.collection('Sensors');
                collection.find().toArray(function (err, sensors) {
                    if (err) {
                        return res.status(500).json(err);
                    }

                    var mappedSensorIDs = [];
                    sensors.forEach(function (mapping) {
                        mappedSensorIDs.push(mapping.sensorID);
                    });


                    var unmappedSensors = [];
                    _.difference(sensorsWithData, mappedSensorIDs).forEach(function (sensor) {
                        //TODO: letzten wert mitgeben?
                        unmappedSensors.push({sensorID: sensor});
                    });

                    res.json({
                        sensors: sensors,
                        unmappedSensors: unmappedSensors
                    });
                });
            });
        });
        app.put('/api/settings', function (req, res) {
            var collection = db.collection('Sensors');
            collection.update(
                {sensorID: req.body.sensorID},
                {$set: req.body},
                {upsert: true},
                function (err) {
                    if (err) {
                        return res.status(500).json(err);
                    }
                    res.status(200).json(err);
                }
            );
        });

        app.listen(settings.webserver.port, function () {
            console.log('Webserver listening on port %s', settings.webserver.port);
        });
    }
};