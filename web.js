/**
 * Created by hypfer on 11.02.15.
 */
var fs = require('fs'),
    express = require('express'),
    hbs = require('hbs'),
    bodyParser = require('body-parser'),
    _ = require('underscore'),
    url = require('url'),
    async = require('async');

var gaugeTypes = {
    temp: {
        glow: true,
        units: "°C",
        title: "Temperature",
        minValue: -25,
        maxValue: 45,
        majorTicks: "['-25','-20','-15','-10','-5','0','5','10','15','20','25','30','35','40','45']",
        minorTicks: 5,
        strokeTicks: true,
        highlights: "[{ from : -25, to : 0, color : 'rgba(0,   0, 255, .3)' },{ from : 0, to : 45, color : 'rgba(255, 0, 0, .3)'}]",
        colors: "{plate      : '#f5f5f5',majorTicks : '#000',minorTicks : '#222',title      : '#222',units      : '#666',numbers    : '#222',needle     : { start : 'rgba(240, 128, 128, 1)', end : 'rgba(255, 160, 122, .9)' }}",
        valueFormat: "{ int : 2, dec : 2 }"
    },
    hum: {
        glow: true,
        units: "RH %",
        title: "Rel. Humidity",
        minValue: 0,
        maxValue: 100,
        majorTicks: "['0','10','20','30','40','50','60','70','80','90','100']",
        minorTicks: 10,
        strokeTicks: true,
        highlights: "[{ from : 0, to : 35, color : '#d14f1b' },{ from : 35, to : 40, color : '#a1b441' },{ from : 40, to : 60, color : '#628914' },{ from : 60, to : 65, color : '#a1b441' },{ from : 65, to : 100, color : '#3767bc'}]",
        colors: "{plate      : '#f5f5f5',majorTicks : '#000',minorTicks : '#222',title      : '#222',units      : '#666',numbers    : '#222',needle     : { start : 'rgba(240, 128, 128, 1)', end : 'rgba(255, 160, 122, .9)' }}",
        valueFormat: "{ int : 2, dec : 2 }"
    },
    amp: {
        glow: true,
        units: "⚡Amp",
        title: "Ampere",
        minValue: 0,
        maxValue: 15,
        majorTicks: "['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15']",
        minorTicks: 10,
        strokeTicks: true,
        highlights: "[{ from : 0, to : 12, color : '#fff' },{ from : 12, to : 15, color : '#d14f1b' }]",
        colors: "{plate      : '#f5f5f5',majorTicks : '#000',minorTicks : '#222',title      : '#222',units      : '#666',numbers    : '#222',needle     : { start : 'rgba(240, 128, 128, 1)', end : 'rgba(255, 160, 122, .9)' }}",
        valueFormat: "{ int : 2, dec : 3 }"
    },
    voc: {
        glow: true,
        units: "VOC/ppm",
        title: "Air Quality",
        minValue: 400,
        maxValue: 2500,
        majorTicks: "['400','700','1000','1300','1600','1900','2200','2500']",
        minorTicks: 6,
        strokeTicks: true,
        highlights: "[{ from : 400, to : 1000, color : '#0081c7' },{ from : 1000, to : 1500, color : '#86c9ec' },{ from : 1500, to : 2500, color : '#ffdf00' }]",
        colors: "{plate      : '#f5f5f5',majorTicks : '#000',minorTicks : '#222',title      : '#222',units      : '#666',numbers    : '#222',needle     : { start : 'rgba(240, 128, 128, 1)', end : 'rgba(255, 160, 122, .9)' }}",
        valueFormat: "{ int : 4, dec : 0 }"
    }
};



function averageChunk(data, chunkSize) {
    if (chunkSize > 1) {
        chunkSize = chunkSize > 2 ? chunkSize : chunkSize + 1;
        var slimData = [];
        while (data.length > chunkSize) {
            var chunk = _.first(data, chunkSize);
            data = _.rest(data, chunkSize - 1);

            var avgTS = Math.floor((chunk[0][0] + chunk[chunkSize - 1][0]) / 2);
            var avgV = 0;
            chunk.forEach(function(kV) {
                avgV = avgV + kV[1];
            });
            slimData.push([avgTS, avgV / chunkSize]);
        }
        return slimData;
    } else {
        return data;

    }
}

module.exports = {

    _setupWeb: function(db) {
        console.log("Starting Webserver...");
        var graphTpl = fs.readFileSync("./views/graph.hbs");
        var graphTemplate = hbs.compile(graphTpl.toString());
        var gaugeTpl = fs.readFileSync("./views/gauge.hbs");
        var gaugeTemplate = hbs.compile(gaugeTpl.toString());

        var app = express();
        app.set('view engine', 'hbs');

        console.log(__dirname);
        app.use(express.static(__dirname + '/res'));

        app.use(bodyParser.json()); // to support JSON-encoded bodies
        app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
            extended: true
        }));

        app.get('/', function(req, res) {
            minutes = req.query.minutes ? req.query.minutes : 30;
            var graphs = [];
            var gauges = [];
            var collection = db.collection("Sensors");
            collection.find().toArray(function(err, docs) {
                assert.equal(null, err);
                docs.forEach(function(doc) {
                    graphs.push({
                        body: graphTemplate({
                            sensor: doc.sensor,
                            title: doc.fN,
                            type: doc.value,
                            minutes: minutes
                        })
                    });

                    var gaugeOptions = {
                        minValue: 0,
                        maxValue: 100
                    };
                    if (doc.gauge) {
                        gaugeOptions = gaugeTypes[doc.gauge] ? gaugeTypes[doc.gauge] : gaugeOptions;
                    }
                    gaugeOptions.sensor = doc.sensor;
                    gaugeOptions.value = 0;
                    gaugeOptions.width = 240;
                    gaugeOptions.height = 240;
                    gaugeOptions.title = doc.sensor;

                    gauges.push({
                        body: gaugeTemplate(gaugeOptions),
                        fN: doc.fN
                    });
                });
            });
            res.render('index', {
                graphs: graphs,
                gauges: gauges
            });

        });
        app.get('/api/sensors', function(req, res) {
            var collection = db.collection("Sensors");
            collection.find().toArray(function(err, docs) {
                assert.equal(null, err);
                res.send(docs);

            });
        });
        app.get('/api/sensors/:id', function(req, res) {
            var collection = db.collection(req.params.id);
            minutes = req.query.minutes ? req.query.minutes : 30;
            var chunkSize = Math.floor(minutes / 100);
            if (chunkSize > 10) {
                chunkSize = 10
            }

            collection.find({
                ts: {
                    $gt: new Date(new Date() - 1000 * 60 * minutes)
                }
            }).toArray(function(err, docs) {
                assert.equal(null, err);
                var returnArray = [];
                docs.forEach(function(doc) {
                    returnArray.push([
                        doc.ts.getTime(),
                        doc.v
                    ]);
                });

                function sortfunc(a, b) {
                    return a[0] - b[0];
                }
                res.send(averageChunk(returnArray.sort(sortfunc), chunkSize));
            });
        });
        app.get('/api/sensors/:id/*', function(req, res) {
            var path = url.parse(req.url).pathname;
            // split and remove empty element;
            path = path.split('/').filter(function(e) {
                return e.length > 0;
            });
            // remove the first component (graph)
            path = _.uniq(path.slice(2));

            minutes = req.query.minutes ? req.query.minutes : 30;
            var chunkSize = Math.floor(minutes / 100);
            if (chunkSize > 10) {
                chunkSize = 10
            }

            var returnObj = {};
            async.each(path, function(sensor, callback) {
                var collection = db.collection(sensor);
                collection.find({
                    ts: {
                        $gt: new Date(new Date() - 1000 * 60 * minutes)
                    }
                }).toArray(function(err, docs) {
                    assert.equal(null, err);
                    var returnArray = [];
                    docs.forEach(function(doc) {
                        returnArray.push([
                            doc.ts.getTime(),
                            doc.v
                        ]);
                    });

                    function sortfunc(a, b) {
                        return a[0] - b[0];
                    }
                    returnObj[sensor] = averageChunk(returnArray.sort(sortfunc), chunkSize);
                    callback();
                });
            }, function(err) {
                res.send(returnObj);
            });


        });


        app.get('/graph/:id', function(req, res) {
            var sensors = [];
            var collection = db.collection("Sensors");
            minutes = req.query.minutes ? req.query.minutes : 30;
            collection.find({
                sensor: req.params.id
            }).toArray(function(err, docs) {
                assert.equal(null, err);
                docs.forEach(function(doc) {
                    sensors.push({
                        body: graphTemplate({
                            sensor: doc.sensor,
                            title: doc.fN,
                            type: doc.value,
                            minutes: minutes
                        })
                    });
                });
            });
            res.render('index', {
                sensors: sensors
            });
        });
        app.get('/graph/:id/*', function(req, res) {
            minutes = req.query.minutes ? req.query.minutes : 30;
            var path = url.parse(req.url).pathname;
            // split and remove empty element;
            path = path.split('/').filter(function(e) {
                return e.length > 0;
            });
            // remove the first component (graph)
            path = path.slice(1);

            //sensors
            //sensorsurl
            //minutes
            //title
            //type
            var sensorsUrl = "";
            path.forEach(function(path) {
                sensorsUrl += path + "/"
            });
            var sensors = [];
            path.forEach(function(sensor) {

                sensors.push({
                    name: sensor,
                    data: "result[" + sensor + "]"
                })

            });

            //This is an insane hack
            var sensorsString = JSON.stringify(sensors).replace(/,"data":"/g, ',"data":').replace(/"}/g, '}').replace(/result\[/g, 'result["').replace(/\]/g, '"]');
            sensorsString = sensorsString.substring(0, sensorsString.length - 2) + "]";


            res.render('multigraph', {
                sensors: sensorsString,
                title: "Multi",
                type: "Various",
                minutes: minutes,
                sensorsUrl: sensorsUrl
            });
        });
        app.get("/gauge/:id", function(req, res) {
            var collection = db.collection(req.params.id);
            minutes = req.query.minutes ? req.query.minutes : 5;
            minutes = minutes > 30 ? 30 : minutes;

            collection.find({
                ts: {
                    $gt: new Date(new Date() - 1000 * 60 * minutes)
                }
            }).toArray(function(err, docs) {
                assert.equal(null, err);

                var collection2 = db.collection("Sensors");
                collection2.find({
                    sensor: req.params.id
                }).toArray(function(err2, docs2) {
                    var sum = 0;
                    docs.forEach(function(doc) {
                        sum = sum + doc.v;
                    });
                    var gaugeOptions = {
                        minValue: 0,
                        maxValue: 100
                    };
                    if (docs2[0]) {
                        gaugeOptions = gaugeTypes[docs2[0].gauge];
                    }
                    if (req.query.type) {
                        gaugeOptions = gaugeTypes[req.query.type] ? gaugeTypes[req.query.type] : gaugeOptions;
                    }
                    gaugeOptions.sensor = req.params.id;
                    gaugeOptions.value = (sum / docs.length).toString();
                    gaugeOptions.width = 300;
                    gaugeOptions.height = 300;
                    gaugeOptions.standalone = true;
                    res.render("gauge", gaugeOptions);
                });
            });
        });



        app.listen(3001, function() {
            console.log('Webserver listening on port %s', "3001");
        });
    }
};