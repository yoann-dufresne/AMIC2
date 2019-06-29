
class Game {

	constructor() {
		this.player = 0.5;
		this.walls = [];

        // Set up the network connection with the server
        this.network = new Network();
        let that = this;
        // Set handlers
        this.network.set_msg_handler((msg) => {
            // Register as screen
            if (msg.startsWith("id"))
                that.network.send_msg("declare " + that.network.id + " screen");
            else if (msg.startsWith("position"))
                that.handle_move(msg);
            else if (msg.startsWith("order"))
                that.handle_order(msg);
            else
                console.log("Not used: " + msg);
        });

        // Set up the screen drawer
        this.screen = new Screen(this);
	}

    handle_move(msg) {
        let value = Number(msg.split(" ")[1]);
        this.player = (0.5 + value/360.0) % 1.0;
    }

    handle_order(msg) {
        let split = msg.split(" ");
        for (let idx=1 ; idx<split.length ; idx++) {
            if (parseInt(split[idx]) == this.network.id) {
                this.screen.update_screen_context(idx-1, split.length-1);
                break;
            }
        }
    }

}

let game = new Game();
