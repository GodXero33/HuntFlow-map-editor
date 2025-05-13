import { Editor } from "./editor.js";

const ctx = canvas.getContext('2d');

let width = 0;
let height = 0;
let animationFrame = null;

const editor = new Editor();

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
