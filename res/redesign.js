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

    var $main = $("#MAIN");
    var $currentlyRenderedSensors = $(".singleSensor");
    //TODO: Genauer vergleichen. Bei Abweichungen nicht alles neu sondern nur die Abweichung
    if ($currentlyRenderedSensors.length != sensorArray.length) {
        sensorArray.forEach(function (sensor) {
            $("#MAIN").append(sensorTemplate(sensor));
            drawIndicator(
                document.getElementById("canv_" + sensor.sensorID),
                sensor.lastReading,
                sensor.limits[0],
                sensor.limits[1],
                sensor.limitType
            );
        });
        $currentlyRenderedSensors.remove();
        $main.find(".loader").remove();
        //volles rendern + momentane löschen
    } else {
        // wert updaten
        sensorArray.forEach(function (sensor) {
            var $sensor = $(".sensorValueContainer[data-sensorID='" + sensor.sensorID + "']");
            $sensor.text(sensor.lastReading + " " + sensor.unit);
            drawIndicator(
                document.getElementById("canv_" + sensor.sensorID),
                sensor.lastReading,
                sensor.limits[0],
                sensor.limits[1],
                sensor.limitType
            );
        });
        $main.find(".loader").remove();
    }
}


function dismissEvent(notification) {
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

        $.getJSON('/api/sensors/' + self.attr("data-sensorID") + "?minutes=" + localStorage.getItem("minutes"), function (result) {
            if (result) {
                var graphTemplateSource = $("#graph-template").html();
                var graphTemplate = Handlebars.compile(graphTemplateSource);
                self.next().html(graphTemplate({sensorID: self.attr("data-sensorID")}));
                self.next().show();
                highchartsGraph(self.attr("data-sensorID"), self.attr("data-unit"), result);
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
        newSettings["limitType"] = $expansion.find("[name='limitType']").val();
        if (newSettings.name && newSettings.unit && newSettings.limits && newSettings.limitType) {
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
                        self.css("background-color", "#3c763d").delay(600).queue(function (next) {
                            $(this).css("background-color", background);
                            next();
                        });

                    }
                }
            });
        } else {
            var background = self.css("background-color");
            self.css("background-color", "#a94442").delay(600).queue(function (next) {
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
                var $settings = $("#SETTINGS");
                var settingsTemplateSource = $("#settings-template").html();
                var settingsTemplate = Handlebars.compile(settingsTemplateSource);

                $settings.html(settingsTemplate(result));
                $settings.find(".loader").remove();
            }
        }
    });
}

$(document).ready(function () {
    moment.locale("de");
    if (!localStorage.getItem("minutes")) {
        localStorage.setItem("minutes", 30);
    }
    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });
    var $main = $("#MAIN");
    if (!localStorage.getItem("page")) {
        $main.show();
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

function drawIndicator(canvas, current, min, max, type) {
    var colors, grd, center, context;
    colors = {
        bad: "#a94442",
        med: "#8a6d3b",
        good: "#3c763d"
    };
    context = canvas.getContext('2d');
    context.beginPath();
    context.rect(0, 0, 150, 16);
    grd = context.createLinearGradient(0, 0, 150, 16);
    if (typeof min !== "undefined" && typeof max !== "undefined") {
        switch (type) {
            case "normal":
                grd.addColorStop(0, colors.good);
                grd.addColorStop(0.5, colors.med);
                grd.addColorStop(1, colors.bad);
                break;
            case "inverse":

                grd.addColorStop(0, colors.bad);
                grd.addColorStop(0.5, colors.med);
                grd.addColorStop(1, colors.good);
                break;
            case "middle":
                grd.addColorStop(0, colors.bad);
                grd.addColorStop(0.25, colors.med);
                grd.addColorStop(0.5, colors.good);
                grd.addColorStop(0.75, colors.med);
                grd.addColorStop(1, colors.bad);
                break;
            default:
                grd.addColorStop(0, colors.good);
                grd.addColorStop(1, colors.good);
        }
    } else {
        grd.addColorStop(0, colors.good);
        grd.addColorStop(1, colors.good);
    }
    context.fillStyle = grd;
    context.fill();
    context.closePath();
    if (current) {
        if (current <= min) {
            center = 0;
        } else if (current >= max) {
            center = 100;
        } else {
            center = ((current - min) / (max - min)) * 100
        }
    } else {
        center = 50; // if undefined
    }
    center = center * 1.5; // hardcoded for 150px canvas width

    context.beginPath();
    context.moveTo(center - 7.5, 0);
    context.lineTo(center + 7.5, 0);
    context.lineTo(center, 8);
    context.fillStyle = "#F5F7F6";
    context.fill();
    context.closePath();
}

function highchartsGraph(sensorID, unit, data) {
    $("#container_" + sensorID).highcharts({
        chart: {
            type: 'spline',
            marginRight: 10,
            height: 350,
            backgroundColor: 'rgba(255, 255, 255, 0)'
        },
        title: {
            text: ''
        },
        xAxis: {
            type: 'datetime',
            tickPixelInterval: 150,
            labels: {
                style: {
                    color: '#ffffff'
                }
            }
        },
        yAxis: {
            title: {
                text: ""
            },
            plotLines: [{
                value: 0,
                width: 1
            }],
            labels: {
                style: {
                    color: '#ffffff'
                }
            }
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
            data: data,
            color: "#ee4d2e"
        }]
    });
}

function setScope() {
    //TODO: Beautify this
    var minutes = prompt("Minuten?", localStorage.getItem("minutes"));
    if (!isNaN(minutes)) {
        localStorage.setItem("minutes", minutes);
    }
}
