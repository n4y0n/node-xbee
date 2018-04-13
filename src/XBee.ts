import * as SerialPort from "serialport";
import { EventEmitter } from "events";

export const DELIMETER: string = "\n"; // 0x0A
export const DEFAULT_BAUDRATE: number = 9600;


/**
 * @description Wrapper class around SerialPort default methods
 * @extends {EventEmitter}
 */
export class XBee extends EventEmitter {
  port: SerialPort;
  private parser: SerialPort.parsers.Readline;

  /**
   * @description Initialize the xbee class and bind it to a serial port
   * @param port The port to use
   * @param baudRate The baud rate for the comunication
   */
  constructor(port: string, baudRate?: number) {
    super();
    this.port = new SerialPort(port, {
      baudRate: baudRate || DEFAULT_BAUDRATE
    });

    this.port.on("error", () => {
      console.log(`Can't connect to port: ${port}`);
    });

    this.parser = new SerialPort.parsers.Readline({ delimiter: DELIMETER });
    
    this.port.pipe(this.parser);
    
    this.parser.on("data", (...args: any[]) => {
      this.emit("data", args);
    });
  }

  /**
   * @description The same as .on("data", callback)
   * @param callback The callback with the data
   */
  onData(callback: (...args: any[]) => void): void {
    this.on("data", callback);
  }

  /**
   * @description Sends some data through the serial interface
   * @param data The data to send in the form of a string, buffer, or number 
   */
  sendData(data: string | Buffer | number): void {
    if (this.port.writable)
      this.port.write(`${data}${DELIMETER}`);
  }
}