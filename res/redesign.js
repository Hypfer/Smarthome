var pages = ["SETTINGS", "MAIN", "SWITCHES"];

function updateMain() {
    $.ajax({
        url: "/api/main",
        type: 'get',
        success: function (result) {
            if (result) {
                updateEvents(result.events);
                updateSensors(result.sensors);
            }
        }
    });
}

function updateEvents(eventArray) {
    var eventTemplateSource = $("#event-template").html();
    var eventTemplate = Handlebars.compile(eventTemplateSource);
    $oldEvents = $(".event");
    //TODO: Wie bei sensoren nur die änderungen rendern
    eventArray.forEach(function (event) {
        event.ts = moment(event.ts).fromNow();
        event.text = event.emitter.concat(": ", event.detail);
        $("#MAIN").prepend(eventTemplate(event));
    });
    $oldEvents.remove();
}


function updateSensors(sensorArray) {
    var sensorTemplateSource = $("#sensor-template").html();
    var sensorTemplate = Handlebars.compile(sensorTemplateSource);

    var $currentlyRenderedSensors = $(".singleSensor");
    //TODO: Genauer vergleichen. Bei Abweichungen nicht alles neu sondern nur die Abweichung
    if ($currentlyRenderedSensors.length != sensorArray.length) {
        sensorArray.forEach(function (sensor) {
            sensor = transformSensor(sensor);
            $("#MAIN").append(sensorTemplate(sensor));
        });
        $currentlyRenderedSensors.remove();
        //volles rendern + momentane löschen
    } else {
        // wert updaten
        sensorArray.forEach(function (sensor) {
            sensor = transformSensor(sensor);
            var $sensor = $(".sensorReadings [data-sensorID='" + sensor.sensorID + "']");
            $sensor.css({
                "color": sensor.color,
                "background-color": sensor.bgcolor
            }).text(sensor.lastReading);
        });
    }
}

function transformSensor(sensor) {
    var sensorReadingColors = [ // good, medium, bad
        ["#3c763d", "#d6e9c6"],// color, background
        ["#8a6d3b", "#faebcc"],
        ["#a94442", "#ebccd1"]
    ];
    //TODO: This doesn't look right
    sensor.limits[0] = sensor.limits[0] ? sensor.limits[0] : -99999999999;
    sensor.limits[1] = sensor.limits[1] ? sensor.limits[1] : 99999999999;
    var warnRange = (sensor.limits[1] - sensor.limits[0]) * 0.25;
    if (sensor.lastReading < sensor.limits[0]) {
        sensor.color = sensorReadingColors[2][0];
        sensor.bgcolor = sensorReadingColors[2][1];
    } else if (sensor.lastReading <= sensor.limits[0] + warnRange || sensor.lastReading >= sensor.limits[1] - warnRange) {
        sensor.color = sensorReadingColors[1][0];
        sensor.bgcolor = sensorReadingColors[1][1];
    } else if (sensor.lastReading >= sensor.limits[1]) {
        sensor.color = sensorReadingColors[2][0];
        sensor.bgcolor = sensorReadingColors[2][1];
    } else {
        sensor.color = sensorReadingColors[0][0];
        sensor.bgcolor = sensorReadingColors[0][1];
    }
    sensor.lastReading = sensor.lastReading ? sensor.lastReading : "???";

    return sensor;
}


function dismissEvent(notification) {
    console.log(notification.attr("data-eventID"));
    $.ajax({
        url: '/api/events',
        type: 'DELETE',
        data: {_id: notification.attr("data-eventID")},
        success: function (result) {
            //TODO:handle result?
            notification.remove();
        }
    });
}

function toggleSensorExpansion(self) {
    if (self.next().is(":visible")) {
        self.next().hide();
    } else {

        //TODO: Add Minutes param
        $.getJSON('/api/sensors/' + self.attr("data-sensorID"), function (result) {
            if (result) {
                var graphTemplateSource = $("#graph-template").html();
                var graphTemplate = Handlebars.compile(graphTemplateSource);
                self.next().html(graphTemplate({sensorID: self.attr("data-sensorID")}));
                self.next().show();
                highchartsGraph(self.attr("data-sensorID"), "ABC", result);
            }
        });
    }

}
function toggleOptionExpansion(self) {

    if (self.next().is(":visible")) {
        var $expansion = self.next();
        var newSettings = {};
        newSettings["sensorID"] = $expansion.attr("data-sensorID");
        newSettings["name"] = $expansion.find("[name='name']").val();
        newSettings["unit"] = $expansion.find("[name='unit']").val();
        newSettings["limits"] = $expansion.find("[name='limits']").val();
        if (newSettings.name && newSettings.unit && newSettings.limits) {
            limitsString = newSettings.limits;
            newSettings.limits = limitsString.split(",");
            newSettings.limits[0] = parseFloat(newSettings.limits[0]);
            newSettings.limits[1] = parseFloat(newSettings.limits[1]);
            $.ajax({
                url: '/api/settings',
                type: 'PUT',
                data: newSettings,
                success: function (result) {
                    if (result) {
                        alert(result);
                    } else {
                        self.next().hide();
                        var background = self.css("background-color");
                        self.css("background-color", "#dff0d8").delay(600).queue(function (next) {
                            $(this).css("background-color", background);
                            next();
                        });

                    }
                }
            });
        } else {
            var background = self.css("background-color");
            self.css("background-color", "#f2dede").delay(600).queue(function (next) {
                $(this).css("background-color", background);
                next();
            });
            self.next().hide();
        }


    } else {
        self.next().show();
    }
}

function switchPage(page) {
    var currentPage = localStorage.getItem("page");
    if (page != currentPage) {
        $("#" + currentPage).hide();
        $("#" + page).show();
        localStorage.setItem("page", page);
    }
}

function pageLeft() {
    var page = localStorage.getItem("page");
    var pageNum = pages.indexOf(page);
    if (pageNum != 0) {
        switchPage(pages[pageNum - 1]);
    }
}
function pageRight() {
    var page = localStorage.getItem("page");
    var pageNum = pages.indexOf(page);
    if (pageNum != pages.length - 1) {
        switchPage(pages[pageNum + 1]);
    }
}

function updateSettings() {
    $.ajax({
        url: "/api/settings",
        type: 'get',
        success: function (result) {
            if (result) {
                var settingsTemplateSource = $("#settings-template").html();
                var settingsTemplate = Handlebars.compile(settingsTemplateSource);

                $("#SETTINGS").html(settingsTemplate(result));
            }
        }
    });
}

$(document).ready(function () {
    moment.locale("de");
    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });

    if (!localStorage.getItem("page")) {
        $("#MAIN").show();
        localStorage.setItem("page", "MAIN");
    } else {
        $("#" + localStorage.getItem("page")).show();
    }
    updateMain();
    setInterval(updateMain, 60000);
    updateSettings();

    $(document).on("swiperight", function () {
        pageLeft();
    });
    $(document).on("swipeleft", function () {
        pageRight();
    });
    $(".page-right").on("click", function () {
        pageRight();
    });
    $(".page-left").on("click", function () {
        pageLeft();
    })

});

function highchartsGraph(sensorID, unit, data) {
    $("#container_" + sensorID).highcharts({
        chart: {
            type: 'spline',
            marginRight: 10,
            height: 350
        },
        title: {
            text: unit
        },
        xAxis: {
            type: 'datetime',
            tickPixelInterval: 150
        },
        yAxis: {
            title: {
                text: unit
            },
            plotLines: [{
                value: 0,
                width: 1
            }]
        },
        subtitle: {
            text: document.ontouchstart === undefined ?
                'Click and drag in the plot area to zoom in' :
                'Pinch the chart to zoom in'
        },

        plotOptions: {
            series: {
                animation: false,
                states: {
                    hover: {
                        enabled: false
                    }
                },
                enableMouseTracking: false
            }
        },
        credits: {
            enabled: false
        },
        tooltip: {
            enabled: false
        },
        legend: {
            enabled: false
        },
        exporting: {
            enabled: false
        },
        series: [{
            name: unit,
            data: data
        }]
    });
}
