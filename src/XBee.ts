import * as SerialPort from "serialport"
import {
  EventEmitter
} from "events"

export interface IOptions {
  delay ? : number
  baudRate ? : number
}

/**
 * @typedef {"location" | "temperature" | "orientation" | "humidity" | "pressure" | "target" | "status" | "command"} EventType
 */

let DELIMETERS: any = {
  location: "L{",
  temperature: "T{",
  orientation: "O{",
  humidity: "U{",
  pressure: "P{",
  target: "G{",
  status: "W{",
  command: "C{"
}


/**
 * @description Default delimeter for the parser to work
 */
export const DELIMETER: string = "\n" // 0x0A

/**
 * @description Default baudRate for the serial port
 */
export const DEFAULT_BAUDRATE: number = 115200

/**
 * @description Wrapper class around SerialPort default methods
 * @extends {EventEmitter}
 */
export default class XBee extends EventEmitter {
  port: SerialPort
  parser: SerialPort.parsers.Readline
  sendQueue: Array<any> 
  delay: number
  sendloop?: NodeJS.Timer

  /**
   * @description Initialize the xbee class and bind it to a serial port
   * @param {string} port The port to use
   * @param {number} baudRate The baud rate for the comunication
   */
  constructor(port: string, options ? : IOptions) {
    super()
    this.port = new SerialPort(port, {
      baudRate: options ? options.baudRate ? options.baudRate : DEFAULT_BAUDRATE : DEFAULT_BAUDRATE
    })

    this.sendQueue = []

    this.delay = options ? options.delay ? options.delay : 0 : 0

    this.port.on("error", () => {
      console.log(`Can't connect to port: ${port}`)
    })

    this.parser = new SerialPort.parsers.Readline({
      delimiter: DELIMETER
    })

    this.port.pipe(this.parser)

    this.parser.on("data", (...args: any[]) => {
      this.handleData(args)
    })

    this.startSendLoop()
  }

  startSendLoop() {
    this.sendLoop()
  }

  sendLoop() {
    this.sendloop = setTimeout(() => {
      if (this.port.writable && this.sendQueue.length > 0)
        this.port.write(`${this.sendQueue.shift()}${DELIMETER}`)
      this.sendLoop()
    }, this.delay)
  }

  /**
   * @description Handle the parsing of the data arriving from the other xbee device
   * @param {any[]} data Data to parse
   */
  handleData(data: any[]): void {
    if (!data || data.length < 1) return
    data.forEach(d => {
      this.check(d.toString())
    })
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
    DELIMETERS[name] = delimeter
  }

  /**
   * Unified send method
   * @param {EventType} event Event name
   * @param {any} data
   * @param {string | undefined} custom Custom delimeter 
   */
  send(event: string, data: any): void {
    this.sendData(`${DELIMETERS.hasOwnProperty(event) ? DELIMETERS[event] : ""}${(data instanceof String) ? data : JSON.stringify(data)}`)
  }

  /**
   * @description Sends some data through the serial interface
   * @param {any} data Data to send in the form of a string, buffer, or number 
   * @example 
   * const xbee = new XBee("port")
   * let a = "data to send"
   * xbee.sendData(a)
   */
  sendData(data: any): void {
    this.sendQueue.push(data)
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