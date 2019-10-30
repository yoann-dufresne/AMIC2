
class Screen {
	constructor(game_state, canvas=null) {
		if (canvas == null)
			this.canvas = document.getElementById("screen");
		else
			this.canvas = canvas;

		this.ctx = this.canvas.getContext('2d');

		this.nb_screen = 1

		// Time for one wall to get from the creation to the end.
		this.rotation_time = 5;

		this.char_relative_height = 0.9;
		this.resize(this.canvas.width, this.canvas.height);

		this.isDrawing = false;
		this.game_state = game_state;
		this.start_refresh();
	}

	resize(width, height) {
		this.canvas.width = width;
		this.canvas.height = height;
		this.char_absolute_height = this.char_relative_height * height;
	}

	update_screen_context(nb_screens) {
		this.nb_screens = nb_screens;
	}

	start_refresh() {
		var self = this;
		this.refreshment = setInterval(()=>{self.draw_canvas()}, 1);
	}

	stop_refresh() {
		clearInterval(this.refreshment);
	}

	draw_canvas() {
		if (this.isDrawing)
			return;
		this.isDrawing = true;

		// Draw the scene
		this.draw_background();
		this.draw_walls();
		this.draw_character();

		this.isDrawing = false;
	}

	draw_background() {
		this.ctx.fillStyle = "black";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

	draw_walls() {
		this.ctx.strokeStyle="#00ff00"
		this.ctx.lineWidth=5;
		let timestamp = (new Date()).getTime();

		let wall_to_remove = null;

		for (let wall of this.game_state.screen_walls) {
			let start = wall[0]; let end = wall[1];
			let wall_relative_height = (timestamp - start) / (end - start);
			// < 0.1 : out of screen
			if (wall_relative_height < 0.1)
				continue;

			if (wall_relative_height > 1.2)
				wall_to_remove = wall;

			// Screen position TODO TODO
			let real_height = this.char_absolute_height * (wall_relative_height - 0.1);

			this.ctx.beginPath();
			this.ctx.moveTo(0, real_height);
			this.ctx.lineTo(this.canvas.width, real_height);
			this.ctx.stroke();
		}

		// remove wall if needed
		if (wall_to_remove != null) {
			this.game_state.screen_walls = this.game_state.screen_walls.filter(item=>item!==wall_to_remove);
			wall_to_remove = null;
		}

	}

	draw_character() {
		let absolute_position = this.game_state.player*this.nb_screens;
		let relative_position = absolute_position - this.game_state.screen_idx;
		// Exceptions for extremities
		if (this.game_state.screen_idx == this.nb_screens - 1 && absolute_position < 0.5) {
			let tmp = relative_position + this.nb_screens;
			if (tmp-0.5 < 0.5-relative_position)
				relative_position = tmp;
		} else if (this.game_state.screen_idx == 0 && absolute_position > this.nb_screens - 0.5) {
			let tmp = relative_position - this.nb_screens;
			if (0.5-tmp < relative_position - 0.5)
				relative_position = tmp;
		}

		// Draw player
		this.ctx.fillStyle = "#00ff00";
		let char_size = Math.min(50, this.canvas.height/11);
		this.ctx.fillRect(
			relative_position*this.canvas.width-char_size/2,
			this.char_relative_height * this.canvas.height,
			char_size,
			char_size
		);
	}
}
