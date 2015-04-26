/**
 * Created by hypfer on 11.02.15.
 */
var express = require('express'),
    hbs = require('hbs'),
    bodyParser = require('body-parser'),
    _ = require('underscore'),
    url = require('url'),
    ObjectID = require('mongodb').ObjectID;

var averageChunk = function (data, chunkSize) {
    if (chunkSize > 1) {
        chunkSize = chunkSize > 2 ? chunkSize : chunkSize + 1;
        var slimData = [];
        while (data.length > chunkSize) {
            var chunk = _.first(data, chunkSize);
            data = _.rest(data, chunkSize - 1);

            var avgTS = Math.floor((chunk[0][0] + chunk[chunkSize - 1][0]) / 2);
            var avgV = 0;

            chunk.forEach(function (kV) {
                avgV = avgV + kV[1];
            });

            slimData.push([avgTS, avgV / chunkSize]);
        }
        return slimData;
    } else {
        return data;
    }
};

module.exports = {
    _setupWeb: function (db) {
        console.log("Starting Webserver...");

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
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            next();
        });

//NEW
        app.delete('/api/events', function (req, res) {
            try {
                var eventID = new ObjectID(req.body._id);
                db.collection("EVENTS").remove({_id: eventID}, function (err, result) {
                    res.send("OK");
                });
            } catch (err) {
                res.status(500).json(err);
            }
        });

        app.get('/api/main', function (req, res) {
            db.collection("Sensors").find().toArray(function (err, sensors) {
                if (err) return res.status(500).json(err);
                db.collection("EVENTS").find().toArray(function (err, events) {
                    if (err) return res.status(500).json(err);
                    res.json({
                        sensors: sensors,
                        events: events
                    });
                });
            });
        });


//END NEW


        app.get('/', function (req, res) {

            res.sendFile('res/index.html', {root: __dirname})

        });

        app.get('/api/sensors/:id', function (req, res) {
            var collection = db.collection("readings_" + req.params.id);
            var minutes = req.query.minutes ? req.query.minutes : 30;
            var chunkSize = Math.floor(minutes / 100);
            if (chunkSize > 10) {
                chunkSize = 10
            }

            collection.find({
                ts: {
                    $gt: new Date(new Date() - 1000 * 60 * minutes)
                }
            }).toArray(function (err, docs) {
                if (err) return res.status(500).json(err);

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

                res.json(averageChunk(returnArray.sort(sortfunc), chunkSize));
            });
        });
        /*
         app.get('/api/sensors/:id/AverageByTimeframe', function (req, res) {

         var collection = db.collection("readings_" + req.params.id);

            if (req.query.start) {
                var start = req.query.start;
            } else {
                return res.status(500).send("Missing start parameter");
            }
            var end = req.query.end ? req.query.end : new Date();

            collection.find({
                ts: {
                    $gte: new Date(start),
                    $lte: new Date(end)
                }
         }).toArray(function (err, docs) {
         if (err) return res.status(500).json(err);

                var sum = 0;

         docs.forEach(function (doc) {
                    sum = sum + doc.v;
                });


                res.json({
                    sensor: req.params.id,
                    start: docs.length > 0 ? docs[0].ts : start,
         end: docs.length > 0 ? docs[docs.length - 1].ts : end,
         avg: docs.length > 0 ? sum / docs.length : 0
                });
            });
        });

         app.get('/graph/:id', function (req, res) {
            var sensors = [];
            var collection = db.collection("Sensors");
            var minutes = req.query.minutes ? req.query.minutes : 30;

            collection.find({
                sensor: req.params.id
         }).toArray(function (err, docs) {
         if (err) return res.status(500).json(err);

         if (docs[0].gauge == "amp") {

         var collection2 = db.collection("readings_" + req.params.id);
         var start = new Date().setHours(0, 0, 0, 0);
         var end = new Date().setHours(23, 59, 59, 999);

                    collection2.find({
                        ts: {
                            $gte: new Date(start),
                            $lte: new Date(end)
                        }
         }).toArray(function (err, docs2) {
         if (err) return res.status(500).json(err);

                        var sum = 0;


         docs2.forEach(function (doc) {
                            sum = sum + doc.v;
                        });
                        if (docs2.length > 0) {
         var avg = (((sum / docs2.length) * 230) * (((docs2[docs2.length - 1].ts - docs2[0].ts) / 1000) / 3600)) / 1000;
                            // 0.24ct/kWh bei ePrimo
         var trivia = "Today: " + avg.toFixed(2) + " kWh, " + (0.24 * avg).toFixed(2) + " €";
         trivia += "  Currently: " + (docs2[docs2.length - 1].v * 230).toFixed(0) + " W";
                        }
                        res.render('graph', {
                            sensor: docs[0].sensor,
         title: docs[0].fN,
         type: docs[0].value,
                            minutes: minutes,
                            trivia: trivia
                        });
                    });
                } else {
                    res.render('graph', {
                        sensor: docs[0].sensor,
         title: docs[0].fN,
         type: docs[0].value,
                        minutes: minutes
                    });
                }
            });
        });
         */
        app.get("/api/settings", function (req, res) {
            db.collectionNames(function (err, collectionList) {
                if (err) return res.status(500).json(err);

                var sensorsWithData = [];
                for (i = 0; i < collectionList.length; i++) { // no forEach because mongo hates me
                    if (collectionList[i].name.indexOf("readings_") != -1) {
                        sensorsWithData.push(collectionList[i].name.split("readings_")[1]);
                    }
                }
                var collection = db.collection("Sensors");
                collection.find().toArray(function (err, sensors) {
                    if (err) return res.status(500).json(err);

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
        app.put("/api/settings", function (req, res) {
            var collection = db.collection("Sensors");
            collection.update(
                {sensorID: req.body.sensorID},
                {$set: req.body},
                {upsert: true},
                function (err) {
                    if (err) return res.status(500).json(err);
                    res.status(200).json(err);
                }
            );
        });

        /*
        //POWER SOCKETS
         app.get("/api/switches", function (req, res) {
            var collection = db.collection("Switches");
         collection.find().toArray(function (err, docs) {
         if (err) return res.status(500).json(err);

                res.json(docs);
            });
        });
         app.get("/api/switches/:id/getState", function (req, res) {
            //If state capable send state else unknown


        });

         app.get("/api/switches/:id/:state", function (req, res) {

         if (!(req.params.state == "0" || req.params.state == "1")) {
                return res.status(500).send("INVALID STATE");
            }
            var collection = db.collection("Switches");

            collection.find({
                name: req.params.id
         }).toArray(function (err, docs) {
         if (err) return res.status(500).json(err);
                if (docs.length == 0) {
                    return res.status(500).send("UNMAPPED SENSOR");
                }
                res.send("HI");

            });
        });
         */
        app.listen(3001, function () {
            console.log('Webserver listening on port %s', "3001");
        });
    }
};