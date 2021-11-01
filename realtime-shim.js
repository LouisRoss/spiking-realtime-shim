const { WebSocketServer } = require('ws');
const fs = require('fs');

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


