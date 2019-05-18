
class Screen {
	constructor(game=new Game()) {
		this.canvas = document.getElementById("screen");
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.ctx = this.canvas.getContext('2d');

		this.game = game;
		this.start_refresh();
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
		// Draw player
		this.ctx.fillStyle = "#00ff00";
		this.ctx.fillRect(this.game.player*this.canvas.width-25, 0.9*this.canvas.height, 50, 50);
		// Draw Walls
		this.ctx.strokeStyle="#00ff00"
		this.ctx.lineWidth=5;
		this.ctx.beginPath();
		this.ctx.moveTo(0,0.2*window.innerHeight);
		this.ctx.lineTo(window.innerWidth,0.2*window.innerHeight);
		this.ctx.stroke();
	}
}
