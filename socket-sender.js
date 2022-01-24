const net = require('net');


class SocketSender {
  constructor(host, port) {
    this.host = host;
    this.port = port;
    this.socket = null;

    this.ConnectAttempt = this.ConnectAttempt.bind(this);
    setTimeout(this.ConnectAttempt, 500);
  }

  ConnectAttempt() {
    //console.log(`Connecting to ${this.host}:${this.port}`);
    this.socket = net.connect(this.port, this.host, () =>{
      console.log(`Connected to ${this.host}:${this.port}`);
    });
  
    this.socket.on('error', error => {
      //console.log(`Error ${error}, Closing socket connection to ${host}:${port}`);
      if (this.socket) {
        this.socket.destroy();
      }
  
      setTimeout(this.ConnectAttempt, 500);
    });
  
    this.socket.on('end', () => {
      console.log(`Server ${this.host}:${this.port} disconnected`);
      setTimeout(this.ConnectAttempt, 500);
    });
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
    this.socket.write(messageBuffer);
    console.log(`Sent ${spikeBuffers.length} spikes to ${this.host}:${this.port}`);
  }
}

module.exports = SocketSender;
