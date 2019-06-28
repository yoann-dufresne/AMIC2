
var WebSocket = WebSocket || MozWebSocket;

class Network {

	constructor() {
		this.serverUrl = "ws://" + window.location.hostname + ":6502";
        console.log(this.serverUrl);
        this.connection = new WebSocket(this.serverUrl);

        this.handlers = [];
        this.id = -1;

        var that = this;
        this.connection.onmessage = function (event) {
            // Get declared id for the central server
            if (event.data.startsWith("id")) {
                that.id = event.data.split(" ")[1];
            }

            // Transmit message to the handlers
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
