

// ----- Screen management -----
class ScreenManager {
  constructor(network_manager) {
    this.screen_div = document.getElementById("screens");
    this.setup_order_button();
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

  setup_order_button() {
    let order_button = document.getElementById("change");
    let that = this;
    order_button.onclick = ()=>{that.start_ordering()};
  }

  start_ordering = function(){
    let order_div = document.getElementById("ordering");
    let order_button = document.getElementById("change");
    let that = this;

    order_div.innerHTML = "";

    // Define the text boxes
    for (let idx=0 ; idx<this.screens.length ; idx++) {
      let screenBox = this.screens[idx];
      let txt_box = document.createElement("input");
      txt_box.type = "text";
      txt_box.value = screenBox.id;
      order_div.appendChild(txt_box);
    }

    // Rename the button and change the function on it
    order_button.innerHTML = "Done";
    order_button.onclick = ()=>{that.order()};
    order_div.appendChild(order_button);
  };

  order() {
    var order_div = document.getElementById("ordering");
    var order_button = document.getElementById("change");
    let that = this;

    // Send message to reorder
    var inputs = Array.from(order_div.getElementsByTagName("input"));
    var values = inputs.map(x=>{return x.value;});
    var message = "order " + values.join(" ");
    this.network.send_msg(message);
    console.log(message);

    // Change the button and revert to pre-ordering
    order_div.innerHTML = "";
    order_button.innerHTML = "Change order";
    order_button.onclick = ()=>{that.start_ordering()};
    order_div.appendChild(order_button);
  }

  /**
   * Handler to add and remove screens from the admin page regarding the network communications
   */
  screen_adder(msg) {
    // New client
    if (msg.startsWith("new_client")) {
      // Add the new screen
      let screen = new ScreenBox(msg.split(" ")[1], this);
      this.screen_div.appendChild(screen.html);
      this.screens.push(screen);
      // Update screens
      for (let idx=0 ; idx<this.screens.length ; idx++) {
        this.screens[idx].screen.update_screen_context(idx, this.screens.length);
      }
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
        
        // Update remaning screens
        for (let idx=0 ; idx<this.screens.length ; idx++) {
          this.screens[idx].screen.update_screen_context(idx, this.screens.length);
        }
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
    let pieces = msg.split(" ");
    let new_screen_order = [];

    // Sort screenbox
    for (let idx=1 ; idx<pieces.length ; idx++)
      for (let screenBox of this.screens) {
        if (screenBox.id == pieces[idx]) {
          new_screen_order.push(screenBox);
          break;
        }
      }

    // Protect from wrongly formatted messages
    if (new_screen_order.length != this.screens.length) {
      console.log("Wrong order message or bad screen order");
      return;
    }

    // Update screen order and remove the boxes from html
    this.screens = new_screen_order;
    this.screen_div.innerHTML = "";

    // Rearange screen boxes 
    for (let idx=0 ; idx<this.screens.length ; idx++) {
      let screenBox = this.screens[idx];
      this.screen_div.appendChild(screenBox.html);
      screenBox.screen.update_screen_context(idx, this.screens.length);
    }
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

