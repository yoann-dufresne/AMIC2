
var WebSocket = WebSocket || MozWebSocket;

class Network {

	constructor() {
		this.serverUrl = "ws://" + window.location.hostname + ":6502";
        this.connection = new WebSocket(this.serverUrl);

        this.handlers = {};
        this.id = -1;

        var that = this;
        this.connection.onmessage = function (event) {
            let values = event.data.split(" ");
            let keyword = values[0];

            // Get declared id for the central server
            if (keyword == "id") {
                that.id = values[1];
            }

            // Stop execution if no handlers
            if (!(keyword in that.handlers))
                return;

            // Transmit message to the handlers
            let handlers = that.handlers[keyword];
            for (let idx=0 ; idx<handlers.length ; idx++)
                handlers[idx](event.data);
        };
	}

    /* Handle messages and redistribute them
     * @param keys Can be a string or an array of strings. These strings are the trigger keyword.
     * @param handler A function to handle the message.
     */
    set_msg_handler(keys, handler) {
        // Transform single value into an array to have a unified code
        if (!Array.isArray(keys))
            keys = [keys];

        for (let key of keys) {
            if (!(key in this.handlers))
                this.handlers[key] = [];

            this.handlers[key].push(handler);
        }
    }

    send_msg(msg) {
        this.connection.send(msg);
    }

}
