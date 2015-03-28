/*
    Abstraction layer for accessing the Simens Gigaset SL400 core functions
    Redone by apx. Thanks!

 */
var SerialPort = require('serialport').SerialPort,
    serialPort = new SerialPort('/dev/ttyACM0');

var events = require("events");

var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

var Gigaset = (function(superClass) {
    extend(Gigaset, superClass);

    function Gigaset() {
        // public
        this.resetCallbacks = bind(this.resetCallbacks, this);
        this.disableRedirect = bind(this.disableRedirect, this);
        this.redirectToNumber = bind(this.redirectToNumber, this);
        this.hangUp = bind(this.hangUp, this);
        this.callNumber = bind(this.callNumber, this);

        // private
        this._reconnect = bind(this._reconnect, this);
        this._setFailureTriggers = bind(this._setFailureTriggers, this);
        this._setSuccessTriggers = bind(this._setSuccessTriggers, this);

        this.timeout = 3000;
        this.successTriggers = [];
        this.failureTriggers = [];

        this.resetCallbacks();
        this._setupListener();
    }

    Gigaset.prototype._setupListener = function() {
        return serialPort.on('open', (function(_this) {
            return function() {
                clearTimeout(_this.timeoutTimer);

                console.log('Serial port to Gigaset opened.');

                _this.emit('open');
            };
        })(this)).on('data', (function(_this) {
            return function(data) {
                clearTimeout(_this.timeoutTimer);
                _this.emit('data', data.toString().split('\r\n').join(''));

                _this._checkTriggers(data, _this.successTriggers, _this.success, 'success');
                _this._checkTriggers(data, _this.failureTriggers, function() {
                    return _this.failure(1, 'Could not handle request. Maybe the line is busy?');
                }, 'success');
            };
        })(this)).on('error', (function(_this) {
            return function(err) {
                clearTimeout(_this.timeoutTimer);

                console.log('Error:', err);
                _this.failure(2, 'Could not send command to phone.');

                return _this._reconnect();
            };
        })(this)).on('close', function(err) {
            clearTimeout(this.timeoutTimer);

            console.log('Connection closed.');

            return setTimeout(function() {
                return serialPort.open();
            }, 2000);
        });
    };


    /*
     Private API
     */

    Gigaset.prototype._setSuccessTriggers = function(triggers) {
        return this.successTriggers = triggers;
    };

    Gigaset.prototype._setFailureTriggers = function(triggers) {
        this.failureTriggers = triggers;

        this.failureTriggers != null && this.failureTriggers.push('ERROR');
    };

    Gigaset.prototype._checkTriggers = function(string, triggers, cb, name) {
        var strings = String(string).trim();
        strings = strings.split(/(\r\n|\n|\r)/gm);

        var i = 0;

        while (i < strings.length) {
            string = strings[i];
            string = string.replace(/(\r\n|\n|\r)/gm, '');

            if (string !== '') {
                if (triggers.indexOf(string) !== -1) {
                    cb();
                }
            }

            i++;
        }
    };

    Gigaset.prototype._sendCommand = function(command) {
        this.timeoutTimer = setTimeout(function() {
            console.log('Did not get a response from the phone...');
            this.failure(3, 'Phone response timed out.');

            return this._reconnect();
        }, this.timeout);

        console.log('Sending: ' + command);

        return serialPort.write(command + '\n', (function(_this) {
            return function(err) {
                if (!err) return;

                clearTimeout(_this.timeoutTimer);

                _this.failure(4, 'Unable to write to phone.');
                console.log('Write error: ' + err);

                return _this._reconnect();
            };
        })(this));
    };

    Gigaset.prototype._reconnect = function() {
        clearTimeout(this.reconnectTimer);

        console.log('Setup reconnect timer.');

        return this.reconnectTimer = setTimeout(function() {
            console.log('Trying to reconnect ...');

            try {
                return serialPort.open();
            } catch (_error) {
                console.log('Error reconnecting to phone...');

                return console.log(_error);
            }
        }, 2000);
    };


    /*
     Public API
     */

    Gigaset.prototype.callNumber = function(number, success, failure) {
        if (success == null) {
            success = function() {};
        }

        if (failure == null) {
            failure = function() {};
        }

        this.success = success;
        this.failure = failure;

        this._setSuccessTriggers(["CLIP:" + number]);
        this._setFailureTriggers(['NO CARRIER']);
        return this._sendCommand("ATDT" + number);
    };

    Gigaset.prototype.hangUp = function(success, failure) {
        if (success == null) {
            success = function() {};
        }
        if (failure == null) {
            failure = function() {};
        }

        this.success = success;
        this.failure = failure;

        this._setSuccessTriggers(['NO CARRIER']);
        this._setFailureTriggers([]);
        return this._sendCommand('ATH');
    };

    Gigaset.prototype.redirectToNumber = function(number, success, failure) {
        if (success == null) {
            success = function() {};
        }
        if (failure == null) {
            failure = function() {};
        }

        return this.callNumber("*21*" + number + "#", (function(_this) {
            return function() {
                return _this.hangUp(success, error);
            };
        })(this), failure);
    };

    Gigaset.prototype.disableRedirect = function(number, success, failure) {
        if (success == null) {
            success = function() {};
        }
        if (failure == null) {
            failure = function() {};
        }

        return this.callNumber("#21#", (function(_this) {
            return function() {
                return _this.hangUp(success, error);
            };
        })(this), failure);
    };

    Gigaset.prototype.resetCallbacks = function() {
        this.success = function() {};
        this.failure = function() {};
    };

    return Gigaset;

})(events);

module.exports = new Gigaset;