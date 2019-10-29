
class Game {

  constructor() {
    // General game game state
    this.gamestate = new GameState();
    // Set up manipulator on gamestate
    this.manipulator = new GameManipulator(this.gamestate);
    // Set up the screen drawer
    this.screen = new Screen(this.gamestate);
    this.screen.resize(window.innerWidth, window.innerHeight);


    // Set up the network connection with the server
    this.network = new Network();
    let that = this;
    // Set handlers
    this.manipulator.set_handlers(this.network);
    this.network.set_msg_handler("id", (msg) => {
      // Register as screen
      that.network.send_msg("declare " + that.network.id + " screen");
    });
    this.network.set_msg_handler("order", msg=>{that.handle_order(msg)});
  }

  handle_order(msg) {
    let split = msg.split(" ");
    for (let idx=1 ; idx<split.length ; idx++) {
      if (parseInt(split[idx]) == this.network.id) {
        this.gamestate.screen_idx = idx-1;
        this.screen.update_screen_context(split.length-1);
        break;
      }
    }
  }

}

let game = new Game();
