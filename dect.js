var gigaset = require("./lib/gigaset");

module.exports = {
    dect: function (db, agenda) {
        var states = {IDLE: 1, WAITING_FOR_CALLERID: 2};
        var state = states.IDLE;
        gigaset.on("data", function (event) {

            if (event == "CLIP:EXTERN") {
                state = states.WAITING_FOR_CALLERID;
                setTimeout(function () {
                    if (state === states.WAITING_FOR_CALLERID) {
                        // timed out
                        handleIncomingCall("UNKNOWN");
                        state = states.IDLE;
                    }
                }, 2000);
            } else if (event.lastIndexOf("CLIP:", 0) === 0) {
                if (state === states.WAITING_FOR_CALLERID) {
                    handleIncomingCall(event.split(":")[1]);
                    state = states.IDLE;
                }
            }
        });

        function handleIncomingCall(number) {
            agenda.now('handleEvent', {
                ts: new Date(),
                severity: "info",
                type: "IncomingCall",
                emitter: "Gigaset",
                detail: number + " calling"
            });
        }
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
