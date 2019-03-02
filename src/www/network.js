
var WebSocket = WebSocket || MozWebSocket;

class Network {

	constructor() {
		this.serverUrl = "ws://" + window.location.hostname + ":6502";
    this.connection = new WebSocket(this.serverUrl);
	}

}

var network = new Network();
