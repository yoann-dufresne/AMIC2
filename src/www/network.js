
var WebSocket = WebSocket || MozWebSocket;

class Network {

	constructor() {
		this.serverUrl = "ws://" + window.location.hostname + ":6502";
        console.log(this.serverUrl);
        this.connection = new WebSocket(this.serverUrl);

        this.handlers = [];

        var that = this;
        this.connection.onmessage = function (event) {
          for (let idx=0 ; idx<that.handlers.length ; idx++)
            that.handlers[idx](event.data);
        };
	}

    set_msg_handler(handler) {
        this.handlers.push(handler);
    }

    send_msg(msg) {
        this.connection.send(msg);
    }

}
