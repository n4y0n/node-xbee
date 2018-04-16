# Xbee module
A xbee transparent mode module for nodejs 
## Installation 
```sh
npm install xbee-module --save
```
## Usage
### Javascript
```javascript
var Xbee = require('xbee-module');
var xbee = new XBee("PORT")
xbee.sendData("some data")

xbee.on("data", function(data) {
  console.log(data)
})
```

### TypeScript
```typescript
import { XBee } from 'xbee-module';
let xbee: XBee = new XBee("PORT")
xbee.sendData("some data")

xbee.on("data", function(data) {
  console.log(data)
})
```
