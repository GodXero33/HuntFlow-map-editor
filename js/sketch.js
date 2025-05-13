import { Editor, EditorImageObject } from "./editor.js";

const ctx = canvas.getContext('2d');
const editor = new Editor(canvas);
let animationFrame = null;

editor.add(new EditorImageObject(_tImage, 0, 0));

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
