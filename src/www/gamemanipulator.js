class GameManipulator {

  constructor(gamestate) {
    this.gamestate = gamestate;
  }

  set_new_wall() {
    // Idx for the wall to check
    let idx = this.gamestate.screen_idx;
    // No need to add a wall
    if (this.gamestate.walls.length <= idx || !this.gamestate.walls[idx])
        return;

    // Compute due time for the wall
    let current_time = (new Date()).getTime();
    let wall_ttl = current_time + this.gamestate.time_per_wall * 1000;
    this.gamestate.screen_walls.push([current_time, wall_ttl]);
  }

  set_handlers(network) {
    let that = this;
    network.set_msg_handler("position", msg=>{that.handle_move(msg)});
    network.set_msg_handler("speed", msg=>{that.handle_speed(msg)});
    network.set_msg_handler("walls", msg=>{that.handle_walls(msg)});
  }

  handle_move(msg) {
    let value = Number(msg.split(" ")[1]);
    this.gamestate.player = (value/360.0) % 1.0;
  }

  handle_speed(msg) {
    let split = msg.split(" ");
    this.gamestate.time_per_wall = Number(split[1]);
  }

  handle_walls(msg) {
    let split = msg.split(" ");
    split.shift();
    this.gamestate.walls = [];
    for (let val of split)
      this.gamestate.walls.push(val.toLowerCase() == "true");
    this.gamestate.set_new_wall();
  }
}