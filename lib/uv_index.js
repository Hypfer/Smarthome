"use strict";
var request = require('request');
var cheerio = require('cheerio');

/* Es gibt in Deutschland anscheinend keine sinnvolle Schnittstelle zum UV-Index abfragen.
 * Daher hier nun dieser hässliche Weg. Für weitere Städte einfach auf der Seite links gucken. */


module.exports = {
    getUVIndex: function (callback) {
        request.get(
            'http://www.weatheronline.de/Niedersachsen/Hannover/UVIndex.htm',
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var $ = cheerio.load(body);
                    callback($('td[height="38"]')[0].children[0].children[0].data);
                }
            }
        );
    }
};