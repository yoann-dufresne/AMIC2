
class Screen {
	constructor(position, canvas=undefined) {
		if (canvas == undefined)
			this.canvas = document.getElementById("screen");
		else
			this.canvas = canvas;

		// TODO: Change to adapt on the wanted size
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		// /TODO
		this.ctx = this.canvas.getContext('2d');

		this.screen_idx = 0
		this.nb_screen = 1

		this.position = position;
		this.start_refresh();
	}

	resize(width, height) {
		this.canvas.width = width;
		this.canvas.height = height;
	}

	update_screen_context(screen_idx, nb_screens) {
		this.screen_idx = screen_idx;
		this.nb_screens = nb_screens;
	}

	start_refresh() {
		var self = this;
		this.refreshment = setInterval(()=>{self.draw_canvas()}, 10);
	}

	stop_refresh() {
		clearInterval(this.refreshment);
	}

	draw_canvas() {
		// Background
		this.ctx.fillStyle = "black";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		
		let absolute_position = this.position.player*this.nb_screens;
		let relative_position = absolute_position - this.screen_idx;
		// Exceptions for extremities
		if (this.screen_idx == this.nb_screens - 1 && absolute_position < 0.5) {
			let tmp = relative_position + this.nb_screens;
			if (tmp-0.5 < 0.5-relative_position)
				relative_position = tmp;
		} else if (this.screen_idx == 0 && absolute_position > this.nb_screens - 0.5) {
			let tmp = relative_position - this.nb_screens;
			if (0.5-tmp < relative_position - 0.5)
				relative_position = tmp;
		}

		// Draw player
		this.ctx.fillStyle = "#00ff00";
		this.ctx.fillRect(relative_position*this.canvas.width-25, 0.9*this.canvas.height, 50, 50);
		// Draw Walls
		this.ctx.strokeStyle="#00ff00"
		this.ctx.lineWidth=5;
		this.ctx.beginPath();
		this.ctx.moveTo(0,0.2*window.innerHeight);
		this.ctx.lineTo(window.innerWidth,0.2*window.innerHeight);
		this.ctx.stroke();
	}
}
