class Editor {
	constructor () {
		this.width = 0;
		this.height = 0;

		this.i = 0;
	}

	draw (ctx) {
		ctx.clearRect(0, 0, this.width, this.height);

		const transform = ctx.getTransform();

		ctx.translate(this.width * 0.5, this.height * 0.5);

		ctx.fillStyle = '#f00';
		ctx.fillRect(Math.cos(this.i) * 200 - 10, Math.sin(this.i) * 200 - 10, 20, 20);

		ctx.setTransform(transform);
	}

	update () {
		this.i += 0.08;
	}
}

export {
	Editor
};
