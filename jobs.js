var child_process = require("child_process");
var assert = require('assert');
var pollen = require('./lib/hexal_pollen');
var uv_index = require('./lib/uv_index');
var dwd_gds = require('./lib/dwd_gds');


module.exports = {
    jobs: function (db, pusher, agenda, secrets) {

        agenda.define("pollLocalAirSensor", function (job, done) {
            child_process.exec("/usr/local/bin/airsensor -o -v", function(err, stdout) {
                var collection = db.collection("readings_AIRQW");
                if(parseFloat(stdout) != 0) {

                    collection.insert([{
                            v: parseFloat(stdout),
                            ts: new Date()
                    }], function (err, result) {
                        assert.equal(err, null);
                        db.collection("Sensors").findOne({sensorID: "AIRQW"}, function (err, doc) {
                            if (doc) {
                                if (doc.limits) {
                                    if (doc.limits[0] && (receivedMessage[1] < doc.limits[0])) {
                                        agenda.now('handleEvent', {
                                            ts: new Date(),
                                            severity: "warning",
                                            type: "SensorOutOfBounds",
                                            emitter: doc.name,
                                            detail: receivedMessage[1] + " is less than " + doc.limits[0]
                                        });
                                    } else if (doc.limits[1] && (receivedMessage[1] > doc.limits[1])) {
                                        agenda.now('handleEvent', {
                                            ts: new Date(),
                                            severity: "warning",
                                            type: "SensorOutOfBounds",
                                            emitter: doc.name,
                                            detail: receivedMessage[1] + " is more than " + doc.limits[1]
                                        });
                                    }
                                }
                                var avg = doc.allTimeAVG ? (doc.allTimeAVG + parseFloat(stdout)) / 2 : parseFloat(stdout);
                                db.collection("Sensors").update({sensorID: "AIRQW"},
                                    {
                                        $set: {
                                            lastReading: parseFloat(stdout),
                                            allTimeAVG: avg
                                        }
                                    }, function (err) {
                                        done();
                                    });
                            }
                        });
                    });
                } else {
                    done();
                }
            })
        });
        agenda.every("30 seconds", "pollLocalAirSensor");


        agenda.define("pollenChecker", function (job, done) {
            pollen.getPollen("31535", function (pollen) {
                var mapping = {
                    "0": "error",
                    "1": "low",
                    "2": "medium",
                    "3": "high"
                };
                var notificationString = "";
                var collection = db.collection("readings_POROG");
                collection.insert([{
                        v: pollen["Roggen"],
                        ts: new Date()
                    }], function (err) {
                        assert.equal(err, null);
                        if (pollen["Roggen"] > 0) notificationString = "Roggen: " + mapping[pollen["Roggen"]];
                        var collection = db.collection("readings_POGRA");
                        collection.insert([{
                            v: pollen["Gräser"],
                            ts: new Date()
                        }], function (err) {
                            assert.equal(err, null);
                            if (pollen["Gräser"] > 0) notificationString += "\nGräser: " + mapping[pollen["Gräser"]];
                            if (notificationString != "") {
                                //TODO: Eventuell limit auf mittel bis schwer?
                                //TODO: Aufsplitten INFO/Warning
                                agenda.now('handleEvent', {
                                    ts: new Date(),
                                    severity: "warning",
                                    type: "PollenWarning",
                                    emitter: "Pollenflug",
                                    detail: notificationString
                                });
                            }
                            done();
                        });
                    }
                );
            });

        });
        agenda.every("45 5 * * *", "pollenChecker");


        agenda.define("uvChecker", function (job, done) {
            uv_index.getUVIndex(function (uvIndex) {
                var collection = db.collection("readings_UVINDEX");
                collection.insert([{
                        v: uvIndex,
                        ts: new Date()
                    }], function (err) {
                        if (err) {
                            agenda.now('handleEvent', {
                                ts: new Date(),
                                severity: "danger",
                                type: "GeneralError",
                                emitter: "ERROR",
                                detail: err
                            });
                        } else {
                            //TODO: Aufsplitten INFO/Warning
                            if (uvIndex > 4) {
                                agenda.now('handleEvent', {
                                    ts: new Date(),
                                    severity: "warning",
                                    type: "UVWarning",
                                    emitter: "UV-Index",
                                    detail: uvIndex
                                });
                            }
                        }
                        done();
                    }
                    );
            });
        });
        agenda.every("45 5 * * *", "uvChecker");


        agenda.define("handleEvent", function (job, done) {
            db.collection("EVENTS").insert([job.attrs.data], function (err) {
                if (err) console.log("Shit. Unable to report err", err);
                pusher.note(secrets.pbMail, 'Smarthome', job.attrs.data.emitter.concat(": ", job.attrs.data.detail), function (err, response) {
                    done();
                });
            });
        });
    }
};
//TODO: Wetterwarnungen