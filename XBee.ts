import * as SerialPort from "serialport";
import { EventEmitter } from "events";

export class XBee extends EventEmitter {
  port: SerialPort;
  parser: SerialPort.parsers.Readline;

  constructor(port: string, baudRate?: number) {
    super();
    this.port = new SerialPort(port, {
      baudRate: 9600
    });

    this.port.on("error", () => {
      console.log(`Can't connect to port: ${port}`);
    });

    this.parser = new SerialPort.parsers.Readline({ delimiter: "\n" });
    
    this.port.pipe(this.parser);
    
    this.parser.on("data", (data) => {
      this.emit("data", data);
    });
  }

  sendData(data: string | Buffer | number): void {
    if (this.port.writable)
      this.port.write(`${data}\n`);
  }
}