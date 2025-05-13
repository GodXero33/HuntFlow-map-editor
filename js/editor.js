class Editor {
	constructor (canvas) {
		this.canvas = canvas;
		this.width = 0;
		this.height = 0;

		this.objects = [];

		this.#initEvents();
	}

	#initEvents () {
		this.canvas.addEventListener('mousedown', this.#mousedown.bind(this));
		window.addEventListener('mousemove', this.#mousemove.bind(this));
		window.addEventListener('mouseup', this.#mouseup.bind(this));
		window.addEventListener('keydown', this.#keydown.bind(this));
		window.addEventListener('keyup', this.#keyup.bind(this));
	}

	#mousedown (event) {}

	#mousemove (event) {}

	#mouseup (event) {}

	#keydown (event) {}

	#keyup (event) {}

	draw (ctx) {
		ctx.clearRect(0, 0, this.width, this.height);

		const transform = ctx.getTransform();

		ctx.translate(this.width * 0.5, this.height * 0.5);

		//

		ctx.setTransform(transform);
	}

	update () {}
}

export {
	Editor
};
