/**
 * Created by hypfer on 11.02.15.
 */
child_process = require("child_process");
assert = require('assert');

module.exports = {

    local: function(db) {

        var _poll = function () {
            child_process.exec("/usr/local/bin/airsensor -o -v", function(err, stdout) {

                var collection = db.collection("AIRQW");
                if(parseFloat(stdout) != 0) {

                    collection.insert([{
                            v: parseFloat(stdout),
                            ts: new Date()
                        }], function (err) {
                            assert.equal(err, null);
                        }
                    );
                }
                setTimeout(_poll, 15E3)
                })
            };
        _poll();
    }
};