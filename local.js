/**
 * Created by hypfer on 11.02.15.
 */
child_process = require("child_process");

var isRunning;

// automatic loop
var _poll = function(db) {
    var _next = function (db) {
        setTimeout(_poll(db), 15E3)
    };

    child_process.exec("/usr/local/bin/airsensor -o -v", function(err, stdout) {
        var collection = db.collection("AIRQW");

        if (+stdout !== 0)
            return collection.insert([{
                v: parseFloat(stdout),
                ts: new Date()
            }], function(err) {
                console.log("GOT ERROR:", err);

                _next(db);
            });

        return _next(db);
    })
};

module.exports = {
    local: function(db) {
        if (isRunning) return console.trace("BUG: airsensor polling has already started.");
        isRunning = true;

        _poll(db);
    }
};