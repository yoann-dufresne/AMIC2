
class Game {

	constructor() {
		this.player = 0.5;
		this.walls = [];

        // Set up the network connection with the server
        this.network = new Network();
        let that = this;
        this.network.set_msg_handler((msg) => {
            // Register as screen
            if (msg.startsWith("id"))
                that.network.send_msg("declare " + that.network.id + " screen");

          console.log(msg);
        });

        // Set up the screen drawer
        this.screen = new Screen(this);
        // this.screen.draw_canvas();
	}

}

let game = new Game();
