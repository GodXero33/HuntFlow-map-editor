import { EditorImageObject, EditorObject } from "./editor.object.js";
import { drawDashedRect, drawSelectRect, isPointInRect } from "./util.js";
import _tImage from "./init-image-tmp.js";
import { TreeHistoryManager } from 'https://cdn.jsdelivr.net/gh/GodXero33/UndoRedoExperiments@main/history-manager.js';

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

		this.panStartPoint = null;
		this.dragStartPoint = null;
		this.dragStartOriginalPoint = null;

		this.minZoomFact = 0.1;
		this.maxZoomFact = 5;
		this.prevZoom = 1;
		this.zoomIntensity = 0.05;

		this.downKeys = new Set();
		this.historyManager = new TreeHistoryManager({});

		this.transform = {
			x: 0,
			y: 0,
			scale: 1
		};

		this.previousCursor = 'default';

		this.#defineKeyBinds();
		this.#initEvents();
		this.addDummies();
	}

	#defineKeyBinds () {
		this.keyBinds = [
			{
				name: 'delete',
				binds: ['x', 'delete'],
				action: () => {
					this.#deleteSelected();
				}
			},
			{
				name: 'undo',
				binds: ['control+z'],
				action: () => {
					// this.#loadHistoryFromData(this.historyManager.undo());
				}
			},
			{
				name: 'redo',
				binds: ['control+y', 'control+shift+z'],
				action: () => {
					// this.#loadHistoryFromData(this.historyManager.redo());
				}
			},
			{
				name: 'select-all',
				binds: ['control+a', 'a'],
				action: () => {
					this.selectedObjects = this.objects.map(object => object);
					this.#updateSelectBoundingRect();
				}
			}
		];
	}

	addDummies () {
		this.add(new EditorImageObject(_tImage, 0, 0));
		this.add(new EditorImageObject(_tImage, 200, 0));
		this.add(new EditorImageObject(_tImage, 200, 200));
		this.add(new EditorImageObject(_tImage, 0, -200));
		this.add(new EditorImageObject(_tImage, -200, -200));
	}

	#initEvents () {
		this.canvas.addEventListener('mousedown', this.#mousedown.bind(this));
		window.addEventListener('mousemove', this.#mousemove.bind(this));
		window.addEventListener('mouseup', this.#mouseup.bind(this));
		window.addEventListener('keydown', this.#keydown.bind(this));
		window.addEventListener('keyup', this.#keyup.bind(this));
		this.canvas.addEventListener('contextmenu', event => event.preventDefault());
		this.canvas.addEventListener('dragover', event => event.preventDefault());
		this.canvas.addEventListener('drop', this.#dropAction.bind(this));
		this.canvas.addEventListener('wheel', this.#wheel.bind(this));
		window.addEventListener('blur', () => this.downKeys.clear());
	}

	#getMouseRelativePoint (x, y) {
		return {
			x: (x - this.transform.x - this.width * 0.5) / this.transform.scale,
			y: (y - this.transform.y - this.height * 0.5) / this.transform.scale
		};
	}

	#dropAction (event) {
		event.preventDefault();

		const files = event.dataTransfer.files;
		const mouseRelativePoint = this.#getMouseRelativePoint(event.x, event.y);
		const dropX = mouseRelativePoint.x;
		const dropY = mouseRelativePoint.y;

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
	}

	#mousedown (event) {
		const { x, y } = this.#getMouseRelativePoint(event.x, event.y);

		if (event.button === 2 || (this.downKeys.has('alt') && event.button === 0)) {
			this.panStartPoint = { x: event.x, y: event.y };
			return;
		}

		if (event.button === 0) {
			this.mousedownObject = this.#getObjectOnMouse(x, y);

			if (this.selectBoundingRect && isPointInRect(this.selectBoundingRect, x, y)) {
				this.dragStartPoint = { x: event.x, y: event.y };
				this.dragStartOriginalPoint = { x: event.x, y: event.y };
				return;
			}
		}
	}

	#mousemove (event) {
		if (this.panStartPoint) {
			this.transform.x += event.x - this.panStartPoint.x;
			this.transform.y += event.y - this.panStartPoint.y;
			this.panStartPoint.x = event.x;
			this.panStartPoint.y = event.y;

			return;
		}

		if (this.dragStartPoint) {
			let dx = (event.x - this.dragStartPoint.x) / this.transform.scale;
			let dy = (event.y - this.dragStartPoint.y) / this.transform.scale;

			this.dragStartPoint.x = event.x;
			this.dragStartPoint.y = event.y;

			this.selectedObjects.forEach(object => {
				object.x += dx;
				object.y += dy;
			});

			this.#updateSelectBoundingRect();
			return;
		}

		const { x, y } = this.#getMouseRelativePoint(event.x, event.y);
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
		if (event.button === 2 || (this.downKeys.has('alt') && event.button === 0)) {
			this.panStartPoint = null;
			return;
		}

		const dragged = this.dragStartPoint !== null && (this.dragStartOriginalPoint.x !== this.dragStartPoint.x || this.dragStartOriginalPoint.y !== this.dragStartPoint.y);
		const { x, y } = this.#getMouseRelativePoint(event.x, event.y);
		const mouseupObject = this.#getObjectOnMouse(x, y);

		if (!dragged && this.mousedownObject && this.mousedownObject === mouseupObject) {
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

		this.dragStartPoint = null;
	}

	#wheel (event) {
		event.preventDefault();

		const { x: worldX, y: worldY } = this.#getMouseRelativePoint(event.x, event.y);
		const newScale = Math.min(this.maxZoomFact, Math.max(this.minZoomFact, this.transform.scale * (1 + Math.sign(event.deltaY) * this.zoomIntensity)));
		const scaleFactor = newScale / this.transform.scale;

		this.transform.x -= (worldX * (scaleFactor - 1)) * this.transform.scale;
		this.transform.y -= (worldY * (scaleFactor - 1)) * this.transform.scale;
		this.transform.scale = newScale;

		this.hoveredObject = null;
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

		this.#checkSelectedObjectsKeyMove();
	}

	#keyup (event) {
		this.downKeys.delete(event.key.toLowerCase());
	}

	#isMouseInSelectBoundingRect (x, y) {
		return this.selectBoundingRect && isPointInRect(this.selectBoundingRect, x, y, EDITOR_SETTINGS.selector_dots_size * 0.5 * this.transform.scale)
	}

	#getObjectOnMouse (x, y) {
		const offset = EDITOR_SETTINGS.selector_dots_size * 0.5 * this.transform.scale;

		return this.objects.find(object => isPointInRect(object, x, y, offset));
	}

	#updateSelectedObjects (object) {
		const isShiftDown = this.downKeys.size == 1 && (this.downKeys.has('shift') || this.downKeys.has('control'));

		if (!isShiftDown) {
			this.selectedObjects.length = 0;

			if (object === this.selectedObjects[0]) {
				this.selectedObjects.push(object);
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
		if (this.previousCursor === cursor) return;

		this.previousCursor = cursor;
		this.canvas.style.cursor = cursor;
	}

	#deleteSelected () {
		this.selectedObjects.forEach(object => {
			this.objects.splice(this.objects.findIndex(checkObject => checkObject === object), 1);
		});

		this.selectedObjects.length = 0;
		this.selectBoundingRect = null;
	}

	#moveSelectedObjectsByOne (dirX, dirY) {
		this.selectedObjects.forEach(object => {
			object.x += dirX;
			object.y += dirY;
		});
	}

	#checkSelectedObjectsKeyMove () {
		if (!this.selectBoundingRect) return;

		if (this.downKeys.has('arrowup')) {
			this.#moveSelectedObjectsByOne(0, -1);
			this.#updateSelectBoundingRect();
		} else if (this.downKeys.has('arrowdown')) {
			this.#moveSelectedObjectsByOne(0, 1);
			this.#updateSelectBoundingRect();
		} else if (this.downKeys.has('arrowleft')) {
			this.#moveSelectedObjectsByOne(-1, 0);
			this.#updateSelectBoundingRect();
		} else if (this.downKeys.has('arrowright')) {
			this.#moveSelectedObjectsByOne(1, 0);
			this.#updateSelectBoundingRect();
		}
	}

	#updateHistory (historyObject) {
		this.historyManager.change(historyObject);
	}

	draw (ctx) {
		ctx.fillStyle = EDITOR_SETTINGS.colors.background;

		ctx.fillRect(0, 0, this.width, this.height);

		const transform = ctx.getTransform();

		ctx.translate(this.width * 0.5, this.height * 0.5);
		ctx.translate(this.transform.x, this.transform.y);

		ctx.scale(this.transform.scale, this.transform.scale);

		this.objects.forEach(object => object.draw(ctx));

		if (this.hoveredObject) this.#drawHoveredObject(ctx);

		if (this.selectBoundingRect) {
			drawSelectRect(ctx, this.selectBoundingRect, EDITOR_SETTINGS.colors.select, this.transform.scale);

			if (this.selectedObjects.length != 1) this.selectedObjects.forEach(object => drawDashedRect(ctx, object, EDITOR_SETTINGS.colors.select, this.transform.scale));
		}

		ctx.setTransform(transform);
	}

	#drawHoveredObject (ctx) {
		ctx.globalAlpha = 0.8;

		this.hoveredObject.draw(ctx);

		ctx.globalAlpha = 1;

		drawSelectRect(ctx, this.hoveredObject, EDITOR_SETTINGS.colors.hover, this.transform.scale);
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
