
class Game {

	constructor() {
		this.player = 0.5;
		this.walls = [];
        let current_time = (new Date()).getTime();
        this.screen_walls = [[current_time, current_time + 5000]];
        this.time_per_wall = 10000;

        // Set up the network connection with the server
        this.network = new Network();
        let that = this;
        // Set handlers
        this.network.set_msg_handler("position", msg=>{that.handle_move(msg)});
        this.network.set_msg_handler("order", msg=>{that.handle_order(msg)});
        this.network.set_msg_handler("speed", msg=>{that.handle_speed(msg)});
        this.network.set_msg_handler("id", (msg) => {
            // Register as screen
            that.network.send_msg("declare " + that.network.id + " screen");
            console.log(that.network.id);
        });

        // Set up the screen drawer
        this.screen = new Screen(this);
        this.screen.resize(window.innerWidth, window.innerHeight);
	}

    set_new_wall() {
        // Idx for the wall to check
        let idx = this.screen.screen_idx;
        // No need to add a wall
        if (this.walls.length <= idx || !this.walls[idx])
            return;

        // Compute due time for the wall
        let current_time = (new Date()).getTime();
        let wall_ttl = current_time + this.time_per_wall * 1000;
        this.screen_walls.push([current_time, wall_ttl]);
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

    handle_speed(msg) {
        let split = msg.split(" ");
        this.time_per_wall = Number(split[1]);
    }

    handle_walls(msg) {
        let split = msg.split(" ");
        split.shift();
        this.walls = [];
        for (val of split)
            this.walls.push(val.toLowerCase() == "true");
        this.set_new_wall();
    }

}

let game = new Game();
