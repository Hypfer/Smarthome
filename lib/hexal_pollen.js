var request = require('request');
var cheerio = require('cheerio');

function yyyymmdd(dateIn) {
    var yyyy = dateIn.getFullYear();
    var mm = dateIn.getMonth() + 1; // getMonth() is zero-based
    mm = mm > 9 ? mm : "0" + mm;
    var dd = dateIn.getDate();
    dd = dd > 9 ? dd : "0" + dd;
    return String(yyyy + "-" + mm + "-" + dd);
}


module.exports = {
    getPollen: function (plz, callback, date) {
        date = date ? date : new Date();
        date = yyyymmdd(date);
        request.post(
            'http://www.allergie.hexal.de/pollenflug/vorhersage/load_pollendaten.php',
            {
                form: {
                    datum: date,
                    plz: plz
                }
            },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    $ = cheerio.load(JSON.parse(body).html);
                    var returnObj = {};
                    $('table tr').each(function () {
                        var key = $(this).find("strong")[0].children[0].data;
                        returnObj[key] = $(this).find("img")[1].attribs.src.split("_")[2].split(".")[0];
                    });
                    callback(returnObj);
                }
            }
        );
    }
};