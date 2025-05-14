import { EditorImageObject, EditorObject } from "./editor.object.js";
import { drawDashedRect, drawSelectRect } from "./util.js";

let EDITOR_SETTINGS = null;

function injectEditorSettingsRefForEditor (editorSettingsRef) {
	EDITOR_SETTINGS = editorSettingsRef;
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
		this.mousedownObject = null;

		this.downKeys = new Set();

		this.keyBinds = [
			{
				name: 'delete',
				binds: ['shift+x', 'delete'],
				action: () => {
					this.#deleteSelected();
				}
			}
		];

		this.keyBindStatus = {
			shift: false,
			control: false,
			alt: false
		};

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

	#mousedown (event) {
		const x = event.x - this.width * 0.5;
		const y = event.y - this.height * 0.5;

		this.mousedownObject = this.#getObjectOnMouse(x, y);
	}

	#mousemove (event) {
		const x = event.x - this.width * 0.5;
		const y = event.y - this.height * 0.5;

		this.hoveredObject = this.#getObjectOnMouse(x, y);

		if (this.selectedObjects.includes(this.hoveredObject)) this.hoveredObject = null;

		if (this.hoveredObject) {
			this.#updateCursor('pointer');
		} else if (this.#isMouseInSelectBoundingRect(x, y)) {
			this.#updateCursor('move');
		} else {
			this.#updateCursor('default');
		}
	}

	#mouseup (event) {
		const x = event.x - this.width * 0.5;
		const y = event.y - this.height * 0.5;

		const mouseupObject = this.#getObjectOnMouse(x, y);

		if (this.mousedownObject && this.mousedownObject === mouseupObject) {
			this.#updateSelectedObjects(mouseupObject);

			this.mousedownObject = null;
			this.hoveredObject = null;

			if (this.#isMouseInSelectBoundingRect(x, y) && this.selectedObjects.includes(mouseupObject)) {
				this.#updateCursor('move');
			} else {
				this.hoveredObject = mouseupObject;

				this.#updateCursor('pointer');
			}
		}
	}

	#splitKeyBind (bind) {
		const result = [];
		let buffer = '';
		let i = 0;

		while (i < bind.length) {
			if (bind[i] === '+') {
				if (bind[i + 1] === '+') {
					if (buffer) result.push(buffer);

					result.push('+');

					buffer = '';
					i += 2;
				} else {
					if (buffer) result.push(buffer);

					buffer = '';
					i++;
				}
			} else {
				buffer += bind[i];
				i++;
			}
		}

		if (buffer) result.push(buffer);

		return result;
	}

	#keydown (event) {
		this.downKeys.add(event.key.toLowerCase());

		this.keyBinds.forEach(bindObject => {
			if (typeof bindObject.action == 'function' && bindObject.binds.find(bind => {
				const parts = this.#splitKeyBind(bind);

				if (this.downKeys.size !== parts.length) return false;

				for (const key of this.downKeys)
					if (!parts.includes(key)) return false;

				return true;
			})) bindObject.action();
		});
	}

	#keyup (event) {
		this.downKeys.delete(event.key.toLowerCase());
	}

	#isMouseInSelectBoundingRect (x, y) {
		return this.selectBoundingRect && this.isPointInRect(this.selectBoundingRect, x, y, EDITOR_SETTINGS.selector_dots_size * 0.5)
	}

	#getObjectOnMouse (x, y) {
		const offset = EDITOR_SETTINGS.selector_dots_size * 0.5;

		return this.objects.find(object => this.isPointInRect(object, x, y, offset));
	}

	isPointInRect (rect, x, y, offset = 0) {
		return x > rect.x - offset &&
			x < rect.x + rect.w + offset &&
			y > rect.y - offset &&
			y < rect.y + rect.h + offset;
	}

	#updateSelectedObjects (object) {
		if (!this.downKeys.has('shift')) {
			const firstSelectedObject = this.selectedObjects[0];
			this.selectedObjects.length = 0;

			if (object === firstSelectedObject) {
				this.#updateSelectBoundingRect();
				return;
			}
		}

		const targetObjectsIndexInSelectObjects = this.selectedObjects.findIndex(checkObject => checkObject === object);

		if (targetObjectsIndexInSelectObjects != -1) {
			this.selectedObjects.splice(targetObjectsIndexInSelectObjects, 1);
			this.#updateSelectBoundingRect();
			return;
		}

		this.selectedObjects.push(object);
		this.#updateSelectBoundingRect();
	}

	#updateSelectBoundingRect () {
		let minX = Infinity;
		let minY = Infinity;
		let maxX = -Infinity;
		let maxY = -Infinity;

		this.selectedObjects.forEach(object => {
			if (minX > object.x) minX = object.x;
			if (minY > object.y) minY = object.y;
			if (maxX < object.x + object.w) maxX = object.x + object.w;
			if (maxY < object.y + object.h) maxY = object.y + object.h;
		});

		this.selectBoundingRect = { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
	}

	#updateCursor (cursor) {
		this.canvas.style.cursor = cursor;
	}

	#deleteSelected () {
		this.selectedObjects.forEach(object => {
			this.objects.splice(this.objects.findIndex(checkObject => checkObject === object), 1);
		});

		this.selectedObjects.length = 0;
		this.selectBoundingRect = null;
	}

	draw (ctx) {
		ctx.fillStyle = EDITOR_SETTINGS.colors.background;

		ctx.fillRect(0, 0, this.width, this.height);

		const transform = ctx.getTransform();

		ctx.translate(this.width * 0.5, this.height * 0.5);

		this.objects.forEach(object => object.draw(ctx));

		if (this.hoveredObject) this.#drawHoveredObject(ctx);

		if (this.selectBoundingRect) {
			drawSelectRect(ctx, this.selectBoundingRect, EDITOR_SETTINGS.colors.select);

			if (this.selectedObjects.length != 1) this.selectedObjects.forEach(object => drawDashedRect(ctx, object, EDITOR_SETTINGS.colors.select));
		}

		ctx.setTransform(transform);
	}

	#drawHoveredObject (ctx) {
		ctx.globalAlpha = 0.8;

		this.hoveredObject.draw(ctx);

		ctx.globalAlpha = 1;

		drawSelectRect(ctx, this.hoveredObject, EDITOR_SETTINGS.colors.hover);
	}

	update () {}

	add (object) {
		if (!(object instanceof EditorObject)) return;

		this.objects.push(object);
	}
}

export {
	injectEditorSettingsRefForEditor,
	Editor
};
