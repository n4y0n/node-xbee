# Xbee module
A xbee transparent mode module for nodejs
## Installation
//TODO
## Usage
### Javascript
```javascript
var XBee = require('module-xbee').XBee;
var xbee = new XBee("PORT")
xbee.send("", "some data")

xbee.on("data", function(data) {
  console.log(data)
})
```

### TypeScript
```typescript
import { XBee } from 'module-xbee';
let xbee: XBee = new XBee("PORT")
xbee.send("", "some data")

xbee.on("data", (data) => {
  console.log(data)
})
```
