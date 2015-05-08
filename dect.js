"use strict";

var gigaset = require("./lib/gigaset");

function handleIncomingCall(number, agenda) {
    agenda.now('handleEvent', {
        ts: new Date(),
        severity: "info",
        type: "IncomingCall",
        emitter: "Gigaset",
        detail: number + " calling"
    });
}

module.exports = {
    dect: function (agenda) {
        var states = {IDLE: 1, WAITING_FOR_CALLERID: 2};
        var state = states.IDLE;
        gigaset.on("data", function (event) {

            if (event === "CLIP:EXTERN") {
                state = states.WAITING_FOR_CALLERID;
                setTimeout(function () {
                    if (state === states.WAITING_FOR_CALLERID) {
                        // timed out
                        handleIncomingCall("UNKNOWN", agenda);
                        state = states.IDLE;
                    }
                }, 2000);
            } else if (event.lastIndexOf("CLIP:", 0) === 0) {
                if (state === states.WAITING_FOR_CALLERID) {
                    handleIncomingCall(event.split(":")[1], agenda);
                    state = states.IDLE;
                }
            }
        });
    }

        /*
         In case of new features break glass

         gigaset.on('open', function (){

         gigaset.callNumber('1234567890', function () {
         console.log.apply(console, arguments)
         }, function () {
         console.log.apply(console, arguments)
         })
         });
         */
};
