
class GameState {

	constructor() {
        // Setup values
        this.time_per_wall = 10; // in seconds
        // Global values
		this.player = 0.5;
		this.walls = [];
        // Local values
        this.screen_idx = 0;
        let current_time = (new Date()).getTime();
        this.screen_walls = [[current_time, current_time + 5000]];
	}

    set_new_wall() {
        // Idx for the wall to check
        let idx = this.screen_idx;
        // No need to add a wall
        if (this.walls.length <= idx || !this.walls[idx])
            return;

        // Compute due time for the wall
        let current_time = (new Date()).getTime();
        let wall_ttl = current_time + this.time_per_wall * 1000;
        this.screen_walls.push([current_time, wall_ttl]);
    }
}
