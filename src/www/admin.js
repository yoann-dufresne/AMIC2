

// ----- Screen management -----
class ScreenManager {
  constructor(network_manager) {
    this.screen_div = document.getElementById("screens");
    this.setup_order_button();
    this.screens = [];
    this.network = network_manager;
    // Register the updaters.
    let that = this;
    this.network.set_msg_handler("new_client", (msg)=>{that.screen_adder(msg)});
    this.network.set_msg_handler("client_closed", (msg)=>{that.screen_remover(msg)});
    this.network.set_msg_handler("order", (msg)=>{that.screen_updater(msg)});
    this.network.set_msg_handler("id", (msg)=>{
      // Register as admin panel
      that.network.send_msg("declare " + that.network.id + " admin");
    });
    this.setup_time_keeper();
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
    // Add the new screen
    let screen = new ScreenBox(msg.split(" ")[1], this);
    this.screen_div.appendChild(screen.html);
    this.screens.push(screen);
    // Update screens
    for (let idx=0 ; idx<this.screens.length ; idx++) {
      this.screens[idx].gamestate.screen_idx = idx;
      this.screens[idx].screen.update_screen_context(this.screens.length);
    }
  }

  screen_remover(msg) {
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
      console.log(new_screen_order, this.screens);
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
      screenBox.gamestate.screen_idx = idx;
      screenBox.screen.update_screen_context(this.screens.length);
    }
  }

  setup_time_keeper() {
    let start_time = 0.0;
    let is_running = false;
    let updater = null;
    let clock = document.getElementById("elapsed_time");

    this.network.set_msg_handler("start", ()=>{
      if (is_running) {
        console.log("multiple start detected");
        return;
      }

      is_running = true;
      start_time = Date.now();

      clock.innerHTML = 0.0;
      clock.style.color = "black";
      updater = setInterval(()=>{clock.innerHTML = ((Date.now()-start_time)/1000)}, 100);
    });

    this.network.set_msg_handler("stop", ()=>{
      if (!is_running)
        return;

      clearInterval(updater);
      is_running = false;
      clock.style.color = "red";
    });
  }
}


class ScreenBox {
  constructor(id, manager) {
    // Create the HTML elements
    this.html = document.createElement("div");
    this.html.classList.add("screen");
    // Create the canvas and start refreshment on it
    this.canvas = document.createElement("canvas");
    this.html.appendChild(this.canvas);

    this.id = id;

    // General game game state
    this.gamestate = new GameState();
    // Set up manipulator on gamestate
    this.manipulator = new GameManipulator(this.gamestate);
    // Set up the screen drawer
    this.screen = new Screen(this.gamestate, this.canvas);
    // Set up message handlers
    this.manipulator.set_handlers(manager.network);

    this.screen.resize(300, 180);
    this.screen.update_screen_context(id-1, 1);
    
    // Title the screen
    let title = document.createElement("p");
    title.innerHTML = id;
    this.html.appendChild(title);

  }
}

class DebugPanel {
  constructor(network) {
    this.network = network;

    // Get the document elements to fill or check
    this.rotation_div = document.getElementById("rotation_sensor");
    this.debug_checkbox = document.getElementById("debug_value");
    this.debug_checkbox_p = document.getElementById("debug_checkbox_p");
    this.start_listening_debug();
    
    // Debug message handler
    let that = this;
    this.network.set_msg_handler("debug", (msg)=>{that.msg_handler(msg)});
  }

  start_listening_debug() {
    let that = this;
    this.debug_checkbox_p.onclick = () => {that.debug_checkbox.onclick();};
    this.debug_checkbox.onclick = () => {
      let debug_value = ! that.debug_checkbox.checked;
      that.debug_checkbox.checked = debug_value;
      that.network.send_msg("debug_value " + (debug_value ? "true" : "false"));
    };
  }

  msg_handler(msg) {
    let split = msg.split(" ");
    if (split[1] == "rotations")
      this.rotation_div.innerHTML = "<p>x: "+split[2]+"</p><p>y: "+split[3]+"</p><p>z: "+split[4]+"</p>";

    if (split[2] == 0.0)
      console.log("WTF?!")
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

  let that = this;
  let term = document.getElementById("net_term");
  document.getElementById("term_send").onclick = () => {
    let text = term.value;
    term.value = "";
    that.network.send_msg(text);
  };
}


// ----- Main -----
let network = new Network();
button_setter(network);
let screener = new ScreenManager(network);
let debug = new DebugPanel(network);

