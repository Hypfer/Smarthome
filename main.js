/**
 * Created by hypfer on 10.02.15.
 */
var dgram = require('dgram');
var express = require('express');
var hbs = require('hbs');
var bodyParser = require('body-parser');
var _ = require('underscore');
var fs = require('fs');

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
            v: parseFloat(receivedMessage[1]),
            ts: new Date()
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

var _setupWeb = function () {
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

        var sensors = [];
        var collection = db.collection("Sensors");
        collection.find().toArray(function(err,docs){
                assert.equal(null,err);
                docs.forEach(function(doc){
                    sensors.push({
                        body: graphTemplate({
                            sensor: doc.sensor,
                            title: doc.fN,
                            type: doc.value
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

    var server = app.listen(3001, function () {

        var host = server.address().address;
        var port = server.address().port;

        console.log('Example app listening at http://%s:%s', host, port);

    });


};



var url = 'mongodb://localhost:27017/homecontrol';
MongoClient.connect(url, function(err, _db) {
    assert.equal(null, err);

    db = _db;

    console.log("Connected to MongoDB.");

    _setupClient();
    _setupWeb();
});
