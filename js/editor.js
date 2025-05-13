const EDITOR_SETTINGS = {
	selector_dots_size: 15
};

class EditorObject {
	constructor (x, y, w, h, r) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.r = r;
	}

	draw (ctx) {}

	drawSelect (ctx) {}

	update () {}
}

class EditorImageObject extends EditorObject {
	constructor (img, x, y, w = 100, h = 100) {
		super(x, y, w, h);

		this.img = img;
		this.h = img.height * w / img.width;
	}

	draw (ctx) {
		ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
	}

	drawSelect (ctx) {
		ctx.save();
		ctx.strokeStyle = '#ffffff';
		ctx.lineWidth = 2;
		ctx.shadowColor = '#000000';
		ctx.shadowBlur = 5;
		
		ctx.strokeRect(this.x, this.y, this.w, this.h);

		ctx.lineWidth = EDITOR_SETTINGS.selector_dots_size;
		ctx.lineCap = 'round';

		ctx.beginPath();

		ctx.moveTo(this.x, this.y);
		ctx.lineTo(this.x, this.y);

		ctx.moveTo(this.x + this.w * 0.5, this.y);
		ctx.lineTo(this.x + this.w * 0.5, this.y);

		ctx.moveTo(this.x + this.w, this.y);
		ctx.lineTo(this.x + this.w, this.y);

		ctx.moveTo(this.x + this.w, this.y + this.h * 0.5);
		ctx.lineTo(this.x + this.w, this.y + this.h * 0.5);

		ctx.moveTo(this.x + this.w, this.y + this.h);
		ctx.lineTo(this.x + this.w, this.y + this.h);

		ctx.moveTo(this.x + this.w * 0.5, this.y + this.h);
		ctx.lineTo(this.x + this.w * 0.5, this.y + this.h);

		ctx.moveTo(this.x, this.y + this.h);
		ctx.lineTo(this.x, this.y + this.h);

		ctx.moveTo(this.x, this.y + this.h * 0.5);
		ctx.lineTo(this.x, this.y + this.h * 0.5);

		ctx.stroke();

		ctx.restore();
	}
}

class Editor {
	constructor (canvas) {
		this.canvas = canvas;
		this.width = 0;
		this.height = 0;

		this.objects = [];
		this.loadedImages = new Map();
		this.loadingImages = new Map();

		this.selectedObjects = [];
		this.selectBoundingRect = null;

		this.hoveredObject = null;

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
					// Image is already in loaded
					this.add(new EditorImageObject(this.loadedImages.get(src), dropX, dropY));
					return;
				}

				if (this.loadingImages.has(src)) {
					// Image is already in loading
					this.add(new EditorImageObject(this.loadingImages.get(src), dropX, dropY));
					return;
				}

				const img = new Image();

				img.addEventListener('load', () => {
					this.loadingImages.delete(src);
					this.loadedImages.set(src, img);
					this.add(new EditorImageObject(img, dropX, dropY));
				});

				this.loadingImages.set(src, img);

				img.src = src;
			});

			reader.readAsDataURL(file);
		});
	}

	#mousedown (event) {}

	#mousemove (event) {
		const x = event.x - this.width * 0.5;
		const y = event.y - this.height * 0.5;

		this.#checkForHoveredObject(x, y);
	}

	#mouseup (event) {}

	#keydown (event) {}

	#keyup (event) {}

	#checkForHoveredObject (x, y) {
		const offset = EDITOR_SETTINGS.selector_dots_size * 0.5;

		this.hoveredObject = this.objects.find(object => {
			return x > object.x - offset && x < object.x + object.w + offset && y > object.y - offset && y < object.y + object.h + offset;
		});

		if (this.hoveredObject) {
			this.canvas.style.cursor = 'pointer';
		} else {
			this.canvas.style.cursor = 'default';
		}
	}

	draw (ctx) {
		ctx.clearRect(0, 0, this.width, this.height);

		const transform = ctx.getTransform();

		ctx.translate(this.width * 0.5, this.height * 0.5);

		this.objects.forEach(object => object.draw(ctx));

		if (this.hoveredObject) this.#drawHoveredObject(ctx);

		ctx.setTransform(transform);
	}

	update () {}

	#drawHoveredObject (ctx) {
		ctx.globalAlpha = 0.8;

		this.hoveredObject.draw(ctx);

		ctx.globalAlpha = 1;

		this.hoveredObject.drawSelect(ctx);
	}

	add (object) {
		if (!(object instanceof EditorObject)) return;

		this.objects.push(object);
	}
}

export {
	Editor,
	EditorImageObject
};
