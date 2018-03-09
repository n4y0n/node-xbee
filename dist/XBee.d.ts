/// <reference types="node" />
/// <reference types="serialport" />
import * as SerialPort from "serialport";
import { EventEmitter } from "events";
export declare class XBee extends EventEmitter {
    port: SerialPort;
    parser: SerialPort.parsers.Readline;
    constructor(port: string, baudRate?: number);
    sendData(data: string | Buffer | number): void;
}
