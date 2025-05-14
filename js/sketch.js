import { Editor } from "./editor.js";
import { EditorImageObject } from "./editor.object.js";
import _tImage from "./init-image-tmp.js";

const ctx = canvas.getContext('2d');
const editor = new Editor(canvas);
let animationFrame = null;

editor.add(new EditorImageObject(_tImage, 0, 0));
editor.add(new EditorImageObject(_tImage, 200, 0));
editor.add(new EditorImageObject(_tImage, 200, 200));
editor.add(new EditorImageObject(_tImage, 0, -200));
editor.add(new EditorImageObject(_tImage, -200, -200));

console.log(editor);

function animate () {
	editor.draw(ctx);
	editor.update();

	animationFrame = requestAnimationFrame(animate);
}

function resize () {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	editor.width = canvas.width;
	editor.height = canvas.height;

	editor.draw(ctx);
}

function init () {
	resize();
	animate();

	window.addEventListener('resize', resize);

	window.addEventListener('blur', () => {
		cancelAnimationFrame(animationFrame);

		animationFrame = null;
	});

	window.addEventListener('focus', () => {
		if (!animationFrame) animate();
	});
}

init();
