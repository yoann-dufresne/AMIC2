
var WebSocket = WebSocket || MozWebSocket;

class Network {

	constructor() {
		this.serverUrl = "ws://" + window.location.hostname + ":6502";
    console.log(this.serverUrl);
    this.connection = new WebSocket(this.serverUrl);

    this.connection.onmessage = function (event) {
      console.log(event.data);
    };
	}

}

var network = new Network();
