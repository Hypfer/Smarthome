/**
 * Created by hypfer on 11.02.15.
 */
var fs = require('fs');
var express = require('express');
var hbs = require('hbs');
var bodyParser = require('body-parser');
assert = require('assert');
var _ = require('underscore');
url = require('url');
async = require('async');

module.exports = {

    _setupWeb: function(db) {
        console.log("Starting Webserver...");
        var graphTpl = fs.readFileSync("./views/graph.hbs");
        var graphTemplate = hbs.compile(graphTpl.toString());


        var app = express();
        app.set('view engine', 'hbs');
        console.log(__dirname);
        app.use(express.static(__dirname + '/res'));

        app.use(bodyParser.json());       // to support JSON-encoded bodies
        app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
            extended: true
        }));


        app.get('/', function (req,res) {
            minutes = req.query.minutes ? req.query.minutes : 30;
            var sensors = [];
            var collection = db.collection("Sensors");
            collection.find().toArray(function(err,docs){
                assert.equal(null,err);
                docs.forEach(function(doc){
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
            res.render('index', {sensors: sensors});

        });
        app.get('/api/sensors', function(req,res) {
            var collection = db.collection("Sensors");
            collection.find().toArray(function(err,docs){
                assert.equal(null, err);
                res.send(docs);

            });
        });
        app.get('/api/sensors/:id', function(req,res){
            var collection = db.collection(req.params.id);
            minutes = req.query.minutes ? req.query.minutes : 30;
            collection.find({ts: { $gt: new Date(new Date() - 1000*60*minutes)}}).toArray(function(err,docs){
                assert.equal(null, err);
                var returnArray = [];
                docs.forEach(function(doc){
                    returnArray.push([
                        doc.ts.getTime(),
                        doc.v
                        ]);
                    });
                function sortfunc(a,b){
                    return a[0] - b[0];
                }
                res.send(returnArray.sort(sortfunc));
            });
        });
        app.get('/api/sensors/:id/*', function(req,res){
            var path = url.parse(req.url).pathname;
            // split and remove empty element;
            path = path.split('/').filter(function (e) {
                return e.length > 0;
            });
            // remove the first component (graph)
            path = _.uniq(path.slice(2));

            minutes = req.query.minutes ? req.query.minutes : 30;
            var returnObj = {};
            async.each(path, function(sensor,callback){
                var collection = db.collection(sensor);
                collection.find({ts: { $gt: new Date(new Date() - 1000*60*minutes)}}).toArray(function(err,docs){
                    assert.equal(null, err);
                    var returnArray = [];
                    docs.forEach(function(doc){
                        returnArray.push([
                            doc.ts.getTime(),
                            doc.v
                        ]);
                    });
                    function sortfunc(a,b){
                        return a[0] - b[0];
                    }
                    returnObj[sensor] = returnArray.sort(sortfunc);
                    callback();
                });
            }, function(err){
                res.send(returnObj);
            });


        });


        app.get('/graph/:id', function(req,res){
            var sensors = [];
            var collection = db.collection("Sensors");
            minutes = req.query.minutes ? req.query.minutes : 30;
            collection.find({sensor: req.params.id}).toArray(function(err,docs){
                assert.equal(null,err);
                docs.forEach(function(doc){
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
            res.render('index', {sensors: sensors});
        });
        app.get('/graph/:id/*', function(req,res){
            minutes = req.query.minutes ? req.query.minutes : 30;
            var path = url.parse(req.url).pathname;
            // split and remove empty element;
            path = path.split('/').filter(function (e) {
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
            path.forEach(function(path){
                sensorsUrl += path+"/"
            });
            var sensors = [];
            path.forEach(function(sensor){

                sensors.push({name: sensor, data: "result["+sensor+"]"})

            });

            //This is an insane hack
            var sensorsString = JSON.stringify(sensors).replace(/,"data":"/g, ',"data":').replace(/"}/g, '}').replace(/result\[/g, 'result["').replace(/\]/g, '"]');
            sensorsString = sensorsString.substring(0, sensorsString.length - 2)+"]";


            res.render('multigraph', {
                sensors: sensorsString,
                title: "Multi",
                type: "Various",
                minutes: minutes,
                sensorsUrl: sensorsUrl});
        });


        app.listen(3001, function () {
            console.log('Webserver listening on port %s', "3001");
        });
    }
};
