
class Game {

	constructor() {
		this.player = 0.5;
		this.walls = [];

    // Set up the network connection with the server
    this.network = new Network();
    this.network.set_msg_handler((msg) => {
      console.log(msg);
    });

    // // Set up the screen drawer
    // this.screen = new Screen();
    // this.screen.draw_canvas();

    let that = this; 
    setInterval(()=>{
      that.network.send_msg("coucou");
      console.log("Msg send");
    }, 3000);
	}

}

let game = new Game();