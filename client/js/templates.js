this["Smarthome"] = this["Smarthome"] || {};
this["Smarthome"]["Templates"] = this["Smarthome"]["Templates"] || {};

this["Smarthome"]["Templates"]["event"] = Handlebars.template({
  "compiler": [6, ">= 2.0.0-beta.1"], "main": function (depth0, helpers, partials, data) {
    var helper, alias1 = helpers.helperMissing, alias2 = "function", alias3 = this.escapeExpression;

    return "<div class=\"event alert alert-"
        + alias3(((helper = (helper = helpers.severity || (depth0 != null ? depth0.severity : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "severity",
          "hash": {},
          "data": data
        }) : helper)))
        + "\" data-eventID=\""
        + alias3(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "_id",
          "hash": {},
          "data": data
        }) : helper)))
        + "\">\n    <span class=\"close\" onclick=\"dismissEvent($(this).parent())\">&times;</span>\n    <i class=\"timestamp\">"
        + alias3(((helper = (helper = helpers.ts || (depth0 != null ? depth0.ts : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "ts",
          "hash": {},
          "data": data
        }) : helper)))
        + "</i> "
        + alias3(((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "text",
          "hash": {},
          "data": data
        }) : helper)))
        + "\n</div>";
  }, "useData": true
});

this["Smarthome"]["Templates"]["sensor"] = Handlebars.template({
  "compiler": [6, ">= 2.0.0-beta.1"], "main": function (depth0, helpers, partials, data) {
    var helper, alias1 = helpers.helperMissing, alias2 = "function", alias3 = this.escapeExpression;

    return "<div class=\"singleSensor\" data-sensorID=\""
        + alias3(((helper = (helper = helpers.sensorID || (depth0 != null ? depth0.sensorID : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "sensorID",
          "hash": {},
          "data": data
        }) : helper)))
        + "\">\n    <div class=\"sensor\" data-sensorID=\""
        + alias3(((helper = (helper = helpers.sensorID || (depth0 != null ? depth0.sensorID : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "sensorID",
          "hash": {},
          "data": data
        }) : helper)))
        + "\" onclick=\"toggleSensorExpansion($(this))\" data-unit=\""
        + alias3(((helper = (helper = helpers.unit || (depth0 != null ? depth0.unit : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "unit",
          "hash": {},
          "data": data
        }) : helper)))
        + "\">\n        <h4>"
        + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "name",
          "hash": {},
          "data": data
        }) : helper)))
        + "</h4>\n\n        <div class=\"sensorDataContainer\" data-sensorID=\""
        + alias3(((helper = (helper = helpers.sensorID || (depth0 != null ? depth0.sensorID : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "sensorID",
          "hash": {},
          "data": data
        }) : helper)))
        + "\">\n            <canvas id=\"canv_"
        + alias3(((helper = (helper = helpers.sensorID || (depth0 != null ? depth0.sensorID : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "sensorID",
          "hash": {},
          "data": data
        }) : helper)))
        + "\" data-sensorID=\""
        + alias3(((helper = (helper = helpers.sensorID || (depth0 != null ? depth0.sensorID : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "sensorID",
          "hash": {},
          "data": data
        }) : helper)))
        + "\" class=\"sensorReadings\" width=\"150\"\n                    height=\"24\"></canvas>\n            <div class=\"sensorValueContainer\" data-sensorID=\""
        + alias3(((helper = (helper = helpers.sensorID || (depth0 != null ? depth0.sensorID : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "sensorID",
          "hash": {},
          "data": data
        }) : helper)))
        + "\">"
        + alias3(((helper = (helper = helpers.lastReading || (depth0 != null ? depth0.lastReading : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "lastReading",
          "hash": {},
          "data": data
        }) : helper)))
        + " "
        + alias3(((helper = (helper = helpers.unit || (depth0 != null ? depth0.unit : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "unit",
          "hash": {},
          "data": data
        }) : helper)))
        + "</div>\n        </div>\n    </div>\n    <div class=\"sensorExpansion\" data-sensorID=\""
        + alias3(((helper = (helper = helpers.sensorID || (depth0 != null ? depth0.sensorID : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "sensorID",
          "hash": {},
          "data": data
        }) : helper)))
        + "\" style=\"display:none;\">\n    </div>\n</div>";
  }, "useData": true
});

this["Smarthome"]["Templates"]["sensor_graph"] = Handlebars.template({
  "1": function (depth0, helpers, partials, data) {
    var helper;

    return "    "
        + this.escapeExpression(((helper = (helper = helpers.trivia || (depth0 != null ? depth0.trivia : depth0)) != null ? helper : helpers.helperMissing), (typeof helper === "function" ? helper.call(depth0, {
          "name": "trivia",
          "hash": {},
          "data": data
        }) : helper)))
        + "\n";
  }, "compiler": [6, ">= 2.0.0-beta.1"], "main": function (depth0, helpers, partials, data) {
    var stack1, helper;

    return "<div id=\"container_"
        + this.escapeExpression(((helper = (helper = helpers.sensorID || (depth0 != null ? depth0.sensorID : depth0)) != null ? helper : helpers.helperMissing), (typeof helper === "function" ? helper.call(depth0, {
          "name": "sensorID",
          "hash": {},
          "data": data
        }) : helper)))
        + "\" style=\"width:100%;height:100%;\"></div>\n"
        + ((stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.trivia : depth0), {
          "name": "if",
          "hash": {},
          "fn": this.program(1, data, 0),
          "inverse": this.noop,
          "data": data
        })) != null ? stack1 : "");
  }, "useData": true
});

this["Smarthome"]["Templates"]["settings"] = Handlebars.template({
  "1": function (depth0, helpers, partials, data) {
    var helper, alias1 = helpers.helperMissing, alias2 = "function", alias3 = this.escapeExpression;

    return "    <div class=\"singleOptionKey\" data-sensorID=\""
        + alias3(((helper = (helper = helpers.sensorID || (depth0 != null ? depth0.sensorID : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "sensorID",
          "hash": {},
          "data": data
        }) : helper)))
        + "\">\n        <div class=\"optionKey\" data-sensorID=\""
        + alias3(((helper = (helper = helpers.sensorID || (depth0 != null ? depth0.sensorID : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "sensorID",
          "hash": {},
          "data": data
        }) : helper)))
        + "\" onclick=\"toggleOptionExpansion($(this))\">\n            <h4>"
        + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "name",
          "hash": {},
          "data": data
        }) : helper)))
        + "</h4>\n\n            <div class=\"sensorDataContainer\" data-sensorID=\""
        + alias3(((helper = (helper = helpers.sensorID || (depth0 != null ? depth0.sensorID : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "sensorID",
          "hash": {},
          "data": data
        }) : helper)))
        + "\">\n                <div class=\"sensorValueContainer\" data-sensorID=\""
        + alias3(((helper = (helper = helpers.sensorID || (depth0 != null ? depth0.sensorID : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "sensorID",
          "hash": {},
          "data": data
        }) : helper)))
        + "\">"
        + alias3(((helper = (helper = helpers.lastReading || (depth0 != null ? depth0.lastReading : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "lastReading",
          "hash": {},
          "data": data
        }) : helper)))
        + " "
        + alias3(((helper = (helper = helpers.unit || (depth0 != null ? depth0.unit : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "unit",
          "hash": {},
          "data": data
        }) : helper)))
        + "</div>\n            </div>\n        </div>\n        <div class=\"optionKeyExpansion\" data-sensorID=\""
        + alias3(((helper = (helper = helpers.sensorID || (depth0 != null ? depth0.sensorID : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "sensorID",
          "hash": {},
          "data": data
        }) : helper)))
        + "\" style=\"display:none;\">\n            <form id=\"form_"
        + alias3(((helper = (helper = helpers.sensorID || (depth0 != null ? depth0.sensorID : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "sensorID",
          "hash": {},
          "data": data
        }) : helper)))
        + "\">\n                Name: <input placeholder=\"Name\" name=\"name\" type=\"text\" size=\"30\" maxlength=\"30\" value=\""
        + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "name",
          "hash": {},
          "data": data
        }) : helper)))
        + "\"> <br>\n                Unit: <input placeholder=\"Unit\" name=\"unit\" type=\"text\" size=\"30\" maxlength=\"30\" value=\""
        + alias3(((helper = (helper = helpers.unit || (depth0 != null ? depth0.unit : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "unit",
          "hash": {},
          "data": data
        }) : helper)))
        + "\"> <br>\n                Limits: <input placeholder=\"Limits (Array)\" name=\"limits\" type=\"text\" size=\"30\" maxlength=\"30\"\n                               value=\""
        + alias3(((helper = (helper = helpers.limits || (depth0 != null ? depth0.limits : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "limits",
          "hash": {},
          "data": data
        }) : helper)))
        + "\"> <br>\n                Limit Type: <input placeholder=\"Limit Type\" name=\"limitType\" type=\"text\" size=\"30\" maxlength=\"30\"\n                                   value=\""
        + alias3(((helper = (helper = helpers.limitType || (depth0 != null ? depth0.limitType : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "limitType",
          "hash": {},
          "data": data
        }) : helper)))
        + "\"> <br>\n            </form>\n        </div>\n    </div>\n";
  }, "3": function (depth0, helpers, partials, data) {
    var helper, alias1 = helpers.helperMissing, alias2 = "function", alias3 = this.escapeExpression;

    return "    <div class=\"singleOptionKey\" data-sensorID=\""
        + alias3(((helper = (helper = helpers.sensorID || (depth0 != null ? depth0.sensorID : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "sensorID",
          "hash": {},
          "data": data
        }) : helper)))
        + "\">\n        <div class=\"optionKey\" data-sensorID=\""
        + alias3(((helper = (helper = helpers.sensorID || (depth0 != null ? depth0.sensorID : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "sensorID",
          "hash": {},
          "data": data
        }) : helper)))
        + "\" onclick=\"toggleOptionExpansion($(this))\">\n            <h4>"
        + alias3(((helper = (helper = helpers.sensorID || (depth0 != null ? depth0.sensorID : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "sensorID",
          "hash": {},
          "data": data
        }) : helper)))
        + "</h4>\n        </div>\n        <div class=\"optionKeyExpansion\" data-sensorID=\""
        + alias3(((helper = (helper = helpers.sensorID || (depth0 != null ? depth0.sensorID : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "sensorID",
          "hash": {},
          "data": data
        }) : helper)))
        + "\" style=\"display:none;\">\n            <form id=\"form_"
        + alias3(((helper = (helper = helpers.sensorID || (depth0 != null ? depth0.sensorID : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "sensorID",
          "hash": {},
          "data": data
        }) : helper)))
        + "\">\n                Name: <input placeholder=\"Name\" name=\"name\" type=\"text\" size=\"30\" maxlength=\"30\" value=\""
        + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "name",
          "hash": {},
          "data": data
        }) : helper)))
        + "\"> <br>\n                Unit: <input placeholder=\"Unit\" name=\"unit\" type=\"text\" size=\"30\" maxlength=\"30\" value=\""
        + alias3(((helper = (helper = helpers.unit || (depth0 != null ? depth0.unit : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "unit",
          "hash": {},
          "data": data
        }) : helper)))
        + "\"> <br>\n                Limits: <input placeholder=\"Limits (Array)\" name=\"limits\" type=\"text\" size=\"30\" maxlength=\"30\"\n                               value=\""
        + alias3(((helper = (helper = helpers.limits || (depth0 != null ? depth0.limits : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "limits",
          "hash": {},
          "data": data
        }) : helper)))
        + "\"> <br>\n                Limit Type: <input placeholder=\"Limit Type\" name=\"limitType\" type=\"text\" size=\"30\" maxlength=\"30\"\n                                   value=\""
        + alias3(((helper = (helper = helpers.limitType || (depth0 != null ? depth0.limitType : depth0)) != null ? helper : alias1), (typeof helper === alias2 ? helper.call(depth0, {
          "name": "limitType",
          "hash": {},
          "data": data
        }) : helper)))
        + "\"> <br>\n            </form>\n        </div>\n    </div>\n";
  }, "compiler": [6, ">= 2.0.0-beta.1"], "main": function (depth0, helpers, partials, data) {
    var stack1;

    return "<h1 class=\"banner\" style=\"text-align: center; margin-bottom: 30px;\">Settings</h1>\n\n<h3 class=\"banner\">Mapped sensors</h3>\n"
        + ((stack1 = helpers.each.call(depth0, (depth0 != null ? depth0.sensors : depth0), {
          "name": "each",
          "hash": {},
          "fn": this.program(1, data, 0),
          "inverse": this.noop,
          "data": data
        })) != null ? stack1 : "")
        + "<h3 class=\"banner\">Unmapped sensors</h3>\n"
        + ((stack1 = helpers.each.call(depth0, (depth0 != null ? depth0.unmappedSensors : depth0), {
          "name": "each",
          "hash": {},
          "fn": this.program(3, data, 0),
          "inverse": this.noop,
          "data": data
        })) != null ? stack1 : "")
        + "<h3 class=\"banner\">Other</h3>\n\n<div class=\"toggleButton\" onclick=\"setScope();\"><h4>Set scope</h4></div>\n<div class=\"toggleButton\" onclick=\"if(confirm('Are you sure?')) location.reload();\"><h4>Refresh</h4></div>\n\n<h3 class=\"banner\">Donate</h3>\n<div class=\"donate\">\n    Bitcoin: 1ktheADFvNwgXE3i84yNhGvQUEja3xSEY\n    <br>\n    Dogecoin: DMab5vnjaF3qdbFeubtE9XEzuKTrvP5LtT\n</div>\n";
  }, "useData": true
});