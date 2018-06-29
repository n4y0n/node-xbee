import * as SerialPort from "serialport"
import * as Debug from "debug"
import {
	EventEmitter
} from "events"

/**
 * @typedef {"position" | "temperature" | "orientation" | "humidity" | "pressure" | "target" | "status" | "command"} EventType
 */

const debug = Debug("xbee-mod")
const _package = require("../package.json")

debug(`Booting %s`, _package.name)

export interface IOptions {
	delay?: number
	baudRate?: number
}

export class BufferType {
	data: any;
	type: string;
	constructor(type: string, data: any) {
		this.type = type;
		this.data = data
	}
}

let DELIMETERS: any = {
	position: "19L{",
	temperature: "19T{",
	orientation: "19O{",
	humidity: "19U{",
	pressure: "19P{",
	target: "19G{",
	status: "19W{",
	command: "19C{"
}

const bufferLength = 20000

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
export class XBee extends EventEmitter {
	port: SerialPort
	parser: SerialPort.parsers.Readline
	sendQueue: Array<BufferType>
	delay: number
	sendloop?: NodeJS.Timer

  /**
   * @description Initialize the xbee class and bind it to a serial port
   * @param {string} port The port to use
   * @param {IOptions} options
   */
	constructor(port: string, options?: IOptions) {
		super()
		this.port = new SerialPort(port, {
			baudRate: options ? options.baudRate ? options.baudRate : DEFAULT_BAUDRATE : DEFAULT_BAUDRATE
		})

		this.sendQueue = []

		this.delay = options ? options.delay ? options.delay : 10 : 10

		this.port.on("error", () => {
			console.log(" xbee :: fatal error")
			debug(`Can't connect to port: %s`, port)
		})

		this.parser = new SerialPort.parsers.Readline({
			delimiter: DELIMETER
		})

		this.port.pipe(this.parser)

		this.parser.on("data", (...args: any[]) => {
			this._handleData(args)
		})

		this._flush()
	}

	_flush() {
		this.sendloop = setTimeout(() => {
			if (this.port.writable && this.sendQueue.length > 0) {
				this._send(this.sendQueue.shift())
			}
			this._flush()
		}, this.delay)
	}

  /**
   * @description Handle the parsing of the data arriving from the other xbee device
   * @param {any[]} data Data to parse
   */
	_handleData(data: any[]): void {
		if (!data || data.length < 1) return
		data.forEach(d => {
			this._check(d.toString())
		})
	}

  /**
   * @description Simple parser for the possible types of data
   * @param {String} string Raw data to parse as ```string```
   */
	_check(string: string): void {
		Object.keys(DELIMETERS).forEach((k) => {
			if (string.indexOf(DELIMETERS[k]) !== -1) {
				this.emit(k, string.split(DELIMETERS[k])[1])
			} else {
				this.emit("data", string)
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
   */
	send(event: any, data: any): void {
		if (!data) {
			data = event
			event = ""
		}

		if (event === "orientation") {
			this._send(new BufferType(event, (data instanceof String) ? data : JSON.stringify(data)))
		}

		if (this.sendQueue.length >= bufferLength) {
			this.sendQueue.shift()
			this.sendQueue.push(new BufferType(event, (data instanceof String) ? data : JSON.stringify(data)))
		} else {
			this.sendQueue.push(new BufferType(event, (data instanceof String) ? data : JSON.stringify(data)))
		}
	}

	/**
	 * @param {BufferType} buffertype
	 */
	_send(buffertype?: BufferType) {
		if (!buffertype) return debug(`No data to send`)
		Object.keys(DELIMETERS).forEach(key => {
			if (buffertype.type === key) this.port.write(`${DELIMETERS[key]}${buffertype.data}${DELIMETER}`)
			else this.port.write(`${buffertype.data}${DELIMETER}`)
		})
	}
}
