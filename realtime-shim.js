//const express = require('express');
//const http = require('http');
//const bodyParser = require('body-parser');
const { WebSocketServer } = require('ws');
const path = require('path');
const fs = require('fs');

//const cors = require("cors"); // enforce CORS, will be set to frontend URL when deployed

let rawdata = fs.readFileSync('/configuration/configuration.json');
let configuration = JSON.parse(rawdata);
console.log(configuration);

var SocketSender = require('./socket-sender.js');
const sender = new SocketSender('192.168.1.142', 8001);

const wss = new WebSocketServer({ port: 5000 });

wss.on('connection', function connection(ws, req) {
  console.log(`WebSocket Connected`);
  ws.on('message', function incoming(message) {
    console.log(`received webSocket spikes ${message}`);
    const spikes = JSON.parse(message);
    sender.Send(spikes);
  });
});

wss.on('close', function close() {
  console.log('WebSocket closed');
});

var singleton = require('./socket-listener.js');
const listener = singleton.getInstance(wss);
listener.Listen(4000, configuration);


//const app = express();
//app.use(cors());

//const router = express.Router();

/*
router.get('/:engine', (req, res) => {
  const { engine } = req.params;
  console.log(`Realtime shim received GET from ${engine}`);

  res.set('Access-Control-Allow-Origin', '*');
  res.json(listener.GetRealtimeRecord());
});

router.post('/:command', (req, res) => {
  const { command } = req.params;

  var response = { response: `Unrecognized POST command resource ${command}` };
  if (command == 'connection') {
    var response = responder.handleConnectionRequest(req.body)
    res.set('Access-Control-Allow-Origin', '*');
    res.json(response);
  }
  else if (command == 'passthrough') {
    var success = responder.handlePassthroughRequest(req.body, (data) => {
      console.log('Backend POST passthrough handling response ' + JSON.stringify(data));
      res.json(data);
    });

    if (!success) {
      res.json({Error: 'Failed to send passthrough command (probably not connected)'})
    }
  }

  //res.json(response);
});

var server = http.createServer(app);
const PORT = 5000;
app.use(bodyParser.json());
app.use('/', router);
app.use(express.static('public'));

server.listen(PORT, () => console.log(`Server running on port http://realtimeshim:${PORT}`));
*/
