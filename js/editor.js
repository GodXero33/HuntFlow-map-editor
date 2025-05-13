class EditorObject {
	constructor (x, y, w, h, r) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.r = r;
	}

	draw (ctx) {}

	update () {}
}

class EditorImageObject extends EditorObject {
	constructor (img, x, y, w = 100, h = 100) {
		super(x, y, w, h);

		this.img = img;
	}

	draw (ctx) {
		ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
	}
}

class Editor {
	constructor (canvas) {
		this.canvas = canvas;
		this.width = 0;
		this.height = 0;

		this.objects = [];
		this.loadedImages = new Map();

		this.#initEvents();
	}

	#initEvents () {
		this.canvas.addEventListener('mousedown', this.#mousedown.bind(this));
		window.addEventListener('mousemove', this.#mousemove.bind(this));
		window.addEventListener('mouseup', this.#mouseup.bind(this));
		window.addEventListener('keydown', this.#keydown.bind(this));
		window.addEventListener('keyup', this.#keyup.bind(this));

		this.canvas.addEventListener('dragover', (event) => {
			event.preventDefault();
		});

		this.canvas.addEventListener('drop', (event) => {
			event.preventDefault();

			const files = event.dataTransfer.files;
			const dropX = event.x - this.width * 0.5;
			const dropY = event.y - this.height * 0.5;
			
			if (files.length == 0 || files[0].type !== 'image/png') {
				console.warn('Wrong file');
				return;
			}

			const file = files[0];
			const reader = new FileReader();

			reader.addEventListener('load', (event) => {
				const src =  event.target.result;

				if (this.loadedImages.has(src)) {
					// Image is already loaded
					this.add(new EditorImageObject(this.loadedImages.get(src), dropX, dropY));
					return;
				}

				const img = new Image();

				img.addEventListener('load', () => {
					this.add(new EditorImageObject(img, dropX, dropY));
				});

				this.loadedImages.set(src, img);

				img.src = src;
			});

			reader.readAsDataURL(file);
		});
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

		this.objects.forEach(object => object.draw(ctx));

		ctx.setTransform(transform);
	}

	update () {}

	add (object) {
		if (!(object instanceof EditorObject)) return;

		this.objects.push(object);
	}
}

export {
	Editor,
	EditorImageObject
};
