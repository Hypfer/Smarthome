"use strict";
var ftp = require("ftp");
var cheerio = require("cheerio");
var async = require("async");

/* Holt die aktuellen Wetterwarnungen vom DWD GDS FTP
 * Gibt einen Array mit Objekten zurück
 * Der Pfad auf dem FTP ist je nach zuständiger Wetterzentrale anzupassen
 * Ebenso das Ortskürzel
 * Dokumentationen:
 * ftp://ftp-outgoing2.dwd.de/gds/specials/warnings/legend_warnings.pdf
 * https://werdis.dwd.de/infos/legend_warnings_CAP.pdf
 */


module.exports = {
    getWarnings: function (config, cb) {
        var c = new ftp();

        c.on("ready", function () {
            c.cwd("gds/specials/warnings/xml/HA/", function (err) {
                if (err) {
                    throw err;
                }
                c.list(function (err, list) {
                    if (err) {
                        throw err;
                    }
                    var returnArray = [];
                    async.each(list, function (warnXMLFile, callback) {
                        if (warnXMLFile.name.split("_")[7] === "HANX.xml") {
                            c.get(warnXMLFile.name, function (err, stream) {
                                var responseXML = '';
                                stream.on('data', function (chunk) {
                                    responseXML += chunk;
                                });
                                stream.on('end', function () {
                                    var $ = cheerio.load(responseXML);
                                    var obj = {};
                                    obj.status = $("status")["0"].children[0].data;
                                    obj.type = $("msgType")["0"].children[0].data;
                                    obj.category = $("category")["0"].children[0].data;
                                    obj.event = $("event")["0"].children[0].data;
                                    obj.urgency = $("urgency")["0"].children[0].data;
                                    obj.severity = $("severity")["0"].children[0].data;
                                    obj.certainty = $("certainty")["0"].children[0].data;
                                    obj.id = $("eventCode")["0"].children[3].children[0].data;
                                    obj.effective = $("effective")["0"].children[0].data;
                                    obj.onset = $("onset")["0"].children[0].data;
                                    obj.expires = $("expires")["0"].children[0].data;
                                    obj.headline = $("headline")["0"].children[0].data;
                                    obj.description = $("description")["0"].children[0].data;
                                    returnArray.push(obj);
                                    callback();
                                });
                            });
                        } else {
                            callback();
                        }
                    }, function (err) {
                        if (err) {
                            throw err;
                        }
                        cb(returnArray);
                        c.end();
                    });

                });
            });

        });

        c.connect({
            host: "ftp-outgoing2.dwd.de",
            user: config.user,
            password: config.password
        });
    }

};