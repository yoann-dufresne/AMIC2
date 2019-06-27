

// ----- Screen management -----
class ScreenManager {
  constructor(network_manager) {
    this.screen_div = document.getElementById("screens");
    this.network = network_manager;
    let that = this;
    this.network.set_msg_handler((msg)=>{that.screen_adder(msg)});
    this.screens = [];
  }

  screen_adder(msg) {
    // New client
    if (msg.startsWith("new_client")) {
      console.log("message:", msg);
      let screen = new Screen(msg.split(" ")[1]);
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
}


class Screen {
  constructor(id) {
    // Save the name
    this.id = id;
    // Create the HTML elements
    this.html = document.createElement("div");
    this.html.classList.add("screen");
    let title = document.createElement("p");
    title.innerHTML = id;
    this.html.appendChild(title);
  }
}


// ----- Main -----
network = new Network();
screener = new ScreenManager(network);

