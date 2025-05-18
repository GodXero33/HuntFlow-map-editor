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

	scale () {}
	rotate () {}
}

class EditorImageObject extends EditorObject {
	constructor (img, x, y, w = 100, h = 100, r = 0) {
		super(x, y, w, h, r);

		this.img = img;
		this.h = img.height * w / img.width;
	}

	draw (ctx) {
		ctx.save();
		ctx.translate(this.x + this.w * 0.5, this.y + this.h * 0.5);
		ctx.rotate(this.r);
		ctx.translate(-this.w * 0.5, -this.h * 0.5);
		ctx.drawImage(this.img, 0, 0, this.w, this.h);
		ctx.restore();
	}

	clone () {
		return new EditorImageObject(this.img, this.x, this.y, this.w, this.h, this.r);
	}

	scale (x, y) {
		this.w += x;
		this.h += y;

		if (this.w < 0) this.w = 0;
		if (this.h < 0) this.h = 0;
	}

	rotate (angle) {
		this.r += angle;
	}
}

export {
	EditorObject,
	EditorImageObject
};
