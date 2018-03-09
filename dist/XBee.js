"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var SerialPort = require("serialport");
var events_1 = require("events");
var XBee = /** @class */ (function (_super) {
    __extends(XBee, _super);
    function XBee(port, baudRate) {
        var _this = _super.call(this) || this;
        _this.port = new SerialPort(port, {
            baudRate: 9600
        });
        _this.port.on("error", function () {
            console.log("Can't connect to port: " + port);
        });
        _this.parser = new SerialPort.parsers.Readline({ delimiter: "\n" });
        _this.port.pipe(_this.parser);
        _this.parser.on("data", function (data) {
            _this.emit("data", data);
        });
        return _this;
    }
    XBee.prototype.sendData = function (data) {
        if (this.port.writable)
            this.port.write(data + "\n");
    };
    return XBee;
}(events_1.EventEmitter));
exports.XBee = XBee;
