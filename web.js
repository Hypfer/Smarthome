/**
 * Created by hypfer on 11.02.15.
 */
var fs = require('fs');
var express = require('express');
var hbs = require('hbs');
var bodyParser = require('body-parser');
assert = require('assert');
var _ = require('underscore');

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
        app.get('/sensors', function(req,res) {
            var collection = db.collection("Sensors");
            collection.find().toArray(function(err,docs){
                assert.equal(null, err);
                res.send(docs);

            });
        });
        app.get('/sensors/:id', function(req,res){
            var collection = db.collection(req.params.id);
            minutes = req.query.minutes ? req.query.minutes : 30;
            collection.find({ts: { $gt: new Date(new Date() - 1000*60*minutes)}}).toArray(function(err,docs){
                assert.equal(null, err);
                var returnArray = [];
                docs.forEach(function(doc){
                    returnArray.push({
                        x: doc.ts.getTime(),
                        y: doc.v

                    });
                });
                res.send(_.sortBy(returnArray,"x"));
            });
        });

        app.listen(3001, function () {
            console.log('Webserver listening on port %s', "3001");
        });
    }
};
