import { XBee } from "./src/XBee";

const xbee1 = new XBee('COM1');

xbee1.onData((data) => {
  console.log(data);
  xbee1.sendData(data);
})
