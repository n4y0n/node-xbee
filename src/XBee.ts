import * as SerialPort from "serialport";
import {
  EventEmitter
} from "events";

// TODO: add custom emitter and delimeter addParser(delimeter, emitter-name)

/**
 * @description Delimeter for the method ```sendCommand``` and ```onCommand()``` or ```on("command", callback)```
 */
const COMMAND_DELIMETER: string = ">$<";

/**
 * @description Default delimeter for the parser to work
 */
export const DELIMETER: string = "\n"; // 0x0A

/**
 * @description Default baudRate for the serial port
 */
export const DEFAULT_BAUDRATE: number = 115200;

/**
 * @description Delimeter for the ```gpsData()``` method
 */
const GPS_DELIMETER: string = "m-gps|";

/**
 * @description Delimeter for the ```bmeData()``` method
 */
const BME_DELIMETER: string = "m-bne|";

/**
 * @description Delimeter for the ```bnoData()``` method
 */
const BNO_DELIMETER: string = "m-bno|";


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
   * @description Method to handle the parsing of the data arriving from the other xbee device
   * @param {any[]} data Data to parse
   */
  handleData(data: any[]) {
    if (!data || data.length < 1) return;
    data.forEach(d => {
      this.check(d.toString());
    });
  }

  /**
   * @description Simple parser for the possible types of data
   * @param {String} string Raw data to parse as ```string```
   */
  check(string: string) {
    if (string.indexOf(COMMAND_DELIMETER) !== -1) this.emit("command", string.split(COMMAND_DELIMETER)[1]);
    else if (string.indexOf(GPS_DELIMETER) !== -1) this.emit("gps-data", string.split(GPS_DELIMETER)[1]);
    else if (string.indexOf(BME_DELIMETER) !== -1) this.emit("bme-data", string.split(BME_DELIMETER)[1]);
    else if (string.indexOf(BNO_DELIMETER) !== -1) this.emit("bno-data", string.split(BNO_DELIMETER)[1]);
    else this.emit("data", string);
  }

  /**
   * @description The same as .on("data", callback)
   * @param {Function} callback The callback with the data
   */
  onData(callback: (...args: any[]) => void): void {
    this.on("data", callback);
  }

  /**
   * @description The same as .on("command", callback)
   * @param {Function} callback The callback with the command
   */
  onCommand(callback: (...args: any[]) => void): void {
    this.on("command", callback);
  }

  /**
   * @description The same as .on("bno-data", callback)
   * @param {Function} callback The callback with the command
   */
  onBnoData(callback: (...args: any[]) => void): void {
    this.on("bno-data", callback);
  }

  /**
   * @description The same as .on("bme-data", callback)
   * @param {Function} callback The callback with the command
   */
  onBmeData(callback: (...args: any[]) => void): void {
    this.on("bme-data", callback);
  }

  /**
   * @description The same as .on("gps-data", callback)
   * @param {Function} callback The callback with the command
   */
  onGpsData(callback: (...args: any[]) => void): void {
    this.on("gps-data", callback);
  }

  /**
   * @description Sends some data through the serial interface
   * @param {string | Buffer | number} data Data to send in the form of a string, buffer, or number 
   * @example 
   * const xbee = new XBee("port")
   * let a = "data to send"
   * xbee.sendData(a)
   */
  sendData(data: string | Buffer | number): void {
    if (this.port.writable)
      this.port.write(`${data}${DELIMETER}`);
  }

  /**
   * @description Method to send commands to ```onCommand(callback)``` or ```on("command", callback)```
   * @param {string} command Command to send
   * @example 
   * xbee.sendCommand("leftMotorOff")
   */
  sendCommand(command: string) {
    this.sendData(`${COMMAND_DELIMETER}${command}`)
  }

  /**
   * @description Method to send bnodata to ```onBnoData(callback)``` or ```on("bno-data", callback)``` 
   * @param {string} bnoData data to send
   */
  sendBnoData(bnoData: string) {
    this.sendData(`${BNO_DELIMETER}${bnoData}`)
  }

  /**
   * @description Method to send bmedata to ```onBmeData(callback)``` or ```on("bme-data", callback)```
   * @param {string} bmeData data to send
   */
  sendBmeData(bmeData: string) {
    this.sendData(`${BME_DELIMETER}${bmeData}`)
  }

  /**
   * @description Method to send gpsData to ```onGpsData(callback)``` or ```on("gps-data", callback)```
   * @param {string} gpsData data to send
   */
  sendGpsData(gpsData: string) {
    this.sendData(`${GPS_DELIMETER}${gpsData}`)
  }
}