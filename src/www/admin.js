

// ----- Screen management -----
class ScreenManager {
  constructor(network_manager) {
    this.screen_div = document.getElementById("screens");
    this.screens = [];
    this.player = 0.5;
    this.network = network_manager;
    // Register the updaters.
    let that = this;
    this.network.set_msg_handler((msg)=>{
      // Register as admin panel
      if (msg.startsWith("id"))
        that.network.send_msg("declare " + that.network.id + " admin");
      else if (msg.startsWith("position"))
        that.handle_move(msg);
    })
    this.network.set_msg_handler((msg)=>{that.screen_adder(msg)});
    this.network.set_msg_handler((msg)=>{that.screen_updater(msg)});
  }

  /**
   * Handler to add and remove screens from the admin page regarding the network communications
   */
  screen_adder(msg) {
    // New client
    if (msg.startsWith("new_client")) {
      let screen = new ScreenBox(msg.split(" ")[1], this);
      this.screen_div.appendChild(screen.html);
      this.screens.push(screen);
    // Client closed
    } else if (msg.startsWith("client_closed")) {
      // Get the screen id
      let id = msg.split(" ")[1];
      for (let idx=0 ; idx<this.screens.length ; idx++) {
        // Search for the corresponding screen.
        screen = this.screens[idx];
        if (screen.id != id)
          continue;

        // Remove the element.
        this.screens.splice(idx);
        this.screen_div.removeChild(screen.html);
        return;
      }
    }
  }

  handle_move(msg) {
    let value = Number(msg.split(" ")[1]);
    this.player = (0.5 + value/360.0) % 1.0;
  }

  /**
   * Handler to update the walls and character position
   */
  screen_updater(msg) {
    console.log("admin screen updater: TODO");
  }
}


class ScreenBox {
  constructor(id, manager) {
    // Save the name
    this.id = id;
    // Create the HTML elements
    this.html = document.createElement("div");
    this.html.classList.add("screen");
    
    // Create the canvas and start refreshment on it
    this.canvas = document.createElement("canvas");
    this.html.appendChild(this.canvas);
    this.screen = new Screen(manager, this.canvas);

    this.screen.resize(300, 180);
    this.screen.update_screen_context(id-1, 1);
    
    // Title the screen
    let title = document.createElement("p");
    title.innerHTML = id;
    this.html.appendChild(title);

  }
}


var button_setter = function(network) {
  document.getElementById("start_game").onclick = () => {
    network.send_msg("start");
  };

  document.getElementById("stop_game").onclick = () => {
    network.send_msg("stop");
  };

  document.getElementById("move_left").onclick = () => {
    network.send_msg("move relative -45.0");
  };

  document.getElementById("move_right").onclick = () => {
    network.send_msg("move relative 45.0");
  };
}


// ----- Main -----
network = new Network();
button_setter(network);
screener = new ScreenManager(network);

