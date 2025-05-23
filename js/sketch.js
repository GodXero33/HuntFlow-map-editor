import { Editor } from "./editor.js";
import { EditorImageObject } from "./editor.object.js";

const ctx = canvas.getContext('2d');
const editor = new Editor(canvas);
let animationFrame = null;

console.log(editor);

function animate () {
	editor.draw(ctx);

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
