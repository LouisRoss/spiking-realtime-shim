const net = require('net');

var socket = null;

const ConnectAttempt = (host, port) => {
  console.log(`Connecting to ${host}:${port}`);
  socket = net.connect(port, host, () =>{
    console.log(`Connected to ${host}:${port}`);
  });

  socket.on('error', error => {
    console.log(`Error ${error}, Closing socket connection to ${host}:${port}`);
    if (socket) {
      socket.destroy();
    }

    setTimeout(ConnectAttempt, 500, host, port);
  });

  socket.on('end', function() {
    console.log('server disconnected');
    setTimeout(ConnectAttempt, 500, host, port);
  });
}

class SocketSender {
  constructor(host, port) {
    this.host = host;
    this.port = port;

    //this.ConnectAttempt = this.ConnectAttempt.bind(this);
    setTimeout(ConnectAttempt, 500, host, port);
  }

  Send(spikes) {
    var bufferHeader = Buffer.alloc(2);
    bufferHeader.writeUInt16LE(spikes.length);

    var spikeBuffers = [];
    spikes.forEach(spike => {
      var bufferSpike = Buffer.alloc(8);
      bufferSpike.writeUInt32LE(spike[0], 0);
      bufferSpike.writeUInt32LE(spike[1], 4);

      spikeBuffers.push(bufferSpike);
    });

    var messageBuffer = Buffer.concat([bufferHeader, ...spikeBuffers], 2 + (8 * spikeBuffers.length));
    socket.write(messageBuffer);
    console.log(`Sent ${spikeBuffers.length} spikes to ${this.host}:${this.port}`);
  }
}

module.exports = SocketSender;
