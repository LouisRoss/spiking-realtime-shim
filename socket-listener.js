const net = require('net');


const HandleQuery = function(buffer) {
  //console.log(`Received request from client with ${buffer.length} bytes`);
  //console.log(buffer);
  //var logLine = "Sensor socket injecting offsets ";
  
  var spikes = new Array();
  const spikeCount = Math.floor((buffer.length - 6) / 8);
  //console.log(`Sensor socket injecting ${spikeCount} spikes`);
  // Adjust loop exit to ignore any fragments at the end of the buffer.
  for (var spikeOffset = 8; spikeOffset < buffer.length - 7; spikeOffset += 8) {
    const tick = buffer.readInt32LE(spikeOffset);
    const neuronIndex = buffer.readInt32LE(spikeOffset + 4);
    spikes.push([tick, neuronIndex]);

    //console.log(`Processing spike at tick ${tick} at neuron ${neuronIndex}`);
    //logLine += ` ${neuronIndex}`;
  }
  //console.log(logLine);

  return spikes;
}

var wsServer = null;

class PrivateSingleton {
  constructor(wss) {
    this._buffer = null;
    this._bufferSize = 0;
    //this._wsServer = wss;
    wsServer = wss;

    this.periodicStatusPoll = this.periodicStatusPoll.bind(this);
    //setInterval(this.periodicStatusPoll, 1000);
  }

  periodicStatusPoll() {
    //this._wsServer.clients.forEach( client => {
    wsServer.clients.forEach( client => {
        client.send(JSON.stringify([[0, 100], [1, 200]]));
    });
  }

  Listen(port, configuration) {
    console.log(`listening on port ${port}`);
    var server = net.createServer(connection => {
      console.log('client connected');
      connection.on('end', function() {
        console.log('client disconnected');
      });

      // Collect incoming chunks and handle when query is completely received.
      connection.on('data', function (chunk) {
        if (this._buffer == null) {
          this._bufferSize = chunk.readInt32LE(0);
          //this._bufferSize *= 8;  // Element count (two 4-byte ints per element), make byte count.
          //console.log(`Received first chunk of length ${chunk.length} containing buffer size ${this._bufferSize}`);
          this._buffer = Buffer.alloc(0);
        }

        this._buffer = Buffer.concat([this._buffer, chunk]);
        if (this._buffer.length >= this._bufferSize /*+ 4*/) {
          const response = JSON.stringify(HandleQuery(this._buffer));
          //this._wsServer.clients.forEach( client => {
          wsServer.clients.forEach( client => {
              client.send(response);
          });
      
          this._buffer = null;
          this._bufferSize = 0;
        }
      });
    });

    server.listen(port, () => {
      console.log('server bound');
    });
  }

  GetRealtimeRecord() {
    if (this._realtimeRecords.length > 0) {
      return this._realtimeRecords.pop();
    }
    else {
      return [[0,100],[0,200]];
    }
  }
}

class socketListener {
  constructor() {
    throw new Error('Use socketListener.getInstance()');
  }
  
  static getInstance(wss) {
    if (!socketListener.instance) {
      socketListener.instance = new PrivateSingleton(wss);
    }
    return socketListener.instance;
  }
}

module.exports = socketListener;
