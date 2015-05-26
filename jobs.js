'use strict';
var child_process = require('child_process');
var assert = require('assert');
var pollen = require('./lib/hexal_pollen');
var uv_index = require('./lib/uv_index');
var dwd_gds = require('./lib/dwd_gds');


module.exports = {
    jobs: function (db, pusher, agenda, settings) {

        agenda.define('pollLocalSensor', function (job, done) {
            //TODO: Sane errorhandling
            child_process.exec(job.attrs.data.command, function (err, stdout) {
                var collection = db.collection('readings_' + job.attrs.data.name);
                collection.insert([{
                    v: parseFloat(stdout),
                    ts: new Date()
                }], function (err, result) {
                    //TODO: Remove assert
                    assert.equal(err, null);
                    db.collection('Sensors').findOne({sensorID: job.attrs.data.name}, function (err, doc) {
                        if (doc) {
                            if (doc.limits) {
                                if (doc.limits[0] && (parseFloat(stdout) < doc.limits[0])) {
                                    agenda.now('handleEvent', {
                                        ts: new Date(),
                                        severity: 'warning',
                                        type: 'SensorOutOfBounds',
                                        emitter: doc.name,
                                        detail: parseFloat(stdout) + ' is less than ' + doc.limits[0]
                                    });
                                } else if (doc.limits[1] && (parseFloat(stdout) > doc.limits[1])) {
                                    agenda.now('handleEvent', {
                                        ts: new Date(),
                                        severity: 'warning',
                                        type: 'SensorOutOfBounds',
                                        emitter: doc.name,
                                        detail: parseFloat(stdout) + ' is more than ' + doc.limits[1]
                                    });
                                }
                            }
                            var avg = doc.allTimeAVG ? (doc.allTimeAVG + parseFloat(stdout)) / 2 : parseFloat(stdout);
                            db.collection('Sensors').update({sensorID: job.attrs.data.name},
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
            });
        });

        settings.localSensors.forEach(function (localSensor) {
            agenda.every(localSensor.interval, 'pollLocalSensor', localSensor);
        });



        agenda.define('pollenChecker', function (job, done) {
            pollen.getPollen('31535', function (pollen) {
                var mapping = {
                    '0': 'error',
                    '1': 'low',
                    '2': 'medium',
                    '3': 'high'
                };
                var notificationString = '';
                if (pollen['Roggen'] > 0) {
                    notificationString = 'Roggen: ' + mapping[pollen['Roggen']];
                }
                if (pollen['Gräser'] > 0) {
                    notificationString += '\nGräser: ' + mapping[pollen['Gräser']];
                }
                if (notificationString !== '') {
                    //TODO: Eventuell limit auf mittel bis schwer?
                    //TODO: Aufsplitten INFO/Warning
                    agenda.now('handleEvent', {
                        ts: new Date(),
                        severity: 'warning',
                        type: 'PollenWarning',
                        emitter: 'Pollenflug',
                        detail: notificationString
                    });
                }
                done();
            });
        });
        agenda.every('45 5 * * *', 'pollenChecker');


        agenda.define('uvChecker', function (job, done) {
            uv_index.getUVIndex(function (uvIndex) {
                //TODO: Aufsplitten INFO/Warning
                if (uvIndex > 4) {
                    agenda.now('handleEvent', {
                        ts: new Date(),
                        severity: 'warning',
                        type: 'UVWarning',
                        emitter: 'UV-Index',
                        detail: uvIndex
                    });
                }
                done();
            });
        });
        agenda.every('45 5 * * *', 'uvChecker');


        agenda.define('handleEvent', function (job, done) {
            //TODO: Handle out of bounds
            if (job.attrs.data.type !== 'SensorOutOfBounds') {
                db.collection('EVENTS').insert([job.attrs.data], function (err) {
                    if (err) {
                        console.log('Shit. Unable to report err', err);
                        return done();
                    }
                    if (pusher) {
                        pusher.note(settings.pushbullet.mail, 'Smarthome', job.attrs.data.emitter.concat(': ', job.attrs.data.detail), function (err, response) {
                            done();
                        });
                    } else {
                        done();
                    }
                });
            } else {
                done();
            }
        });

        agenda.on('fail', function (err, job) {
            console.log('Job failed with error: %s', err.message);
        });

    }
};
//TODO: Wetterwarnungen