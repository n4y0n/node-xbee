import * as SerialPort from "serialport";
import {
  EventEmitter
} from "events";

// TODO: add custom emitter and delimeter for every type of data addParser(delimeter, emitter-name

/**
 * @typedef {string | Buffer | number} DATAS
 * @typedef {"location" | "temperature" | "orientation" | "humidity" | "pressure" | "target" | "status" | "command"} EventType
 */

let DELIMETERS = {
  location: "L{",
  temperature: "T{",
  orientation: "O{",
  humidity: "U{",
  pressure: "P{",
  target: "G{",
  status: "W{",
  command: "C{"
};


/**
 * @description Default delimeter for the parser to work
 */
export const DELIMETER: string = "\n"; // 0x0A

/**
 * @description Default baudRate for the serial port
 */
export const DEFAULT_BAUDRATE: number = 115200;

/**
 * @description Wrapper class around SerialPort default methods
 * @extends {EventEmitter}
 */
export class XBee extends EventEmitter {
  port: SerialPort;
  private parser: SerialPort.parsers.Readline;

  /**
   * @description Initialize the xbee class and bind it to a serial port
   * @param {string} port The port to use
   * @param {number} baudRate The baud rate for the comunication
   */
  constructor(port: string, baudRate ? : number) {
    super();
    this.port = new SerialPort(port, {
      baudRate: baudRate || DEFAULT_BAUDRATE
    });

    this.port.on("error", () => {
      console.log(`Can't connect to port: ${port}`);
    });

    this.parser = new SerialPort.parsers.Readline({
      delimiter: DELIMETER
    });

    this.port.pipe(this.parser);

    this.parser.on("data", (...args: any[]) => {
      this.handleData(args)
    });
  }

  /**
   * @description Handle the parsing of the data arriving from the other xbee device
   * @param {any[]} data Data to parse
   */
  handleData(data: any[]): void {
    if (!data || data.length < 1) return;
    data.forEach(d => {
      this.check(d.toString());
    });
  }

  /**
   * @description Simple parser for the possible types of data
   * @param {String} string Raw data to parse as ```string```
   */
  check(string: string): void {
    Object.keys(DELIMETERS).forEach((k) => {
      if (string.indexOf(DELIMETERS[k]) !== -1) {
        this.emit(k, string.split(DELIMETERS[k])[1])
      }
    })
  }

  /**
   * @description Adds a custom delimeter
   * @param {string} name
   * @param {string} delimeter 
   */
  addDelimeter(name: string, delimeter: string) {
    DELIMETERS[name] = delimeter;
  }

  /**
   * Unified send method
   * @param {EventType} event Event name
   * @param {any} data
   * @param {string | undefined} custom Custom delimeter 
   */
  send(event: string, data: any, custom?: string): void {
    this.sendData(`${DELIMETERS.hasOwnProperty(event) ? DELIMETERS[event] : custom && custom ? custom : ""}${(data instanceof String) ? data : JSON.stringify(data)}`)
  }

  /**
   * @description Sends some data through the serial interface
   * @param {DATAS} data Data to send in the form of a string, buffer, or number 
   * @example 
   * const xbee = new XBee("port")
   * let a = "data to send"
   * xbee.sendData(a)
   */
  sendData(data: any): void {
    if (this.port.writable)
      this.port.write(`${data}${DELIMETER}`);
  }

  /**
   * @description Send commands to ```onCommand(callback)``` or ```on("command", callback)```
   * @param {string} command Command to send
   * @example 
   * xbee.sendCommand("leftMotorOff")
   */
  sendCommand(command: string) {
    this.sendData(`${DELIMETERS["command"]}${command}`)
  }

  /**
   * @description Send location data
   * @param {any} data
   */
  sendLOC(data: any) {
    this.sendData(`${DELIMETERS["location"]}${JSON.stringify(data)}`)
  }

  /**
   * @description Send orientation data
   * @param {any} data
   */
  sendORI(data: any) {
    this.sendData(`${DELIMETERS["orientation"]}${JSON.stringify(data)}`)
  }

  /**
   * @description Send umidity data
   * @param {any} data
   */
  sendUMD(data: any) {
    this.sendData(`${DELIMETERS["humidity"]}${JSON.stringify(data)}`)
  }

  /**
   * @description Send pessure data
   * @param {any} data
   */
  sendPRE(data: any) {
    this.sendData(`${DELIMETERS["pressure"]}${JSON.stringify(data)}`)
  }

  /**
   * @description Send temperature data
   * @param {any} data
   */
  sendTMP(data: any) {
    this.sendData(`${DELIMETERS["temperature"]}${JSON.stringify(data)}`)
  }
}