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

	clone () {
		return null;
	}
}

class EditorImageObject extends EditorObject {
	constructor (img, x, y, w = 100, h = 100, r = 0) {
		super(x, y, w, h, r);

		this.img = img;
		this.h = img.height * w / img.width;
	}

	draw (ctx) {
		ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
	}

	clone () {
		return new EditorImageObject(this.img, this.x, this.y, this.w, this.h, this.r);
	}
}

export {
	EditorObject,
	EditorImageObject
};
