"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var XBee_1 = require("./XBee");
var xbee1 = new XBee_1.XBee('COM1');
xbee1.on("data", function (data) {
    console.log(data);
    xbee1.sendData(data);
});
