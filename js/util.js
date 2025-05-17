let EDITOR_SETTINGS = null;

function drawDashedRect (ctx, rect, color = '#ffffff', scale = 1) {
	ctx.save();

	ctx.strokeStyle = color;
	ctx.lineWidth = 2 / scale;

	ctx.setLineDash([5 / scale, 5 / scale]);
	ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);

	ctx.restore();
}

function drawSelectRect (ctx, rect, color = '#ffffff', scale = 1) {
	ctx.save();

	ctx.strokeStyle = color;
	ctx.lineWidth = 2 / scale;
	ctx.shadowColor = '#000000';
	ctx.shadowBlur = 5;

	ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);

	ctx.lineWidth = EDITOR_SETTINGS.selector_dots_size / scale;
	ctx.lineCap = 'round';

	ctx.beginPath();

	ctx.moveTo(rect.x, rect.y);
	ctx.lineTo(rect.x, rect.y);

	ctx.moveTo(rect.x + rect.w * 0.5, rect.y);
	ctx.lineTo(rect.x + rect.w * 0.5, rect.y);

	ctx.moveTo(rect.x + rect.w, rect.y);
	ctx.lineTo(rect.x + rect.w, rect.y);

	ctx.moveTo(rect.x + rect.w, rect.y + rect.h * 0.5);
	ctx.lineTo(rect.x + rect.w, rect.y + rect.h * 0.5);
rect
	ctx.moveTo(rect.x + rect.w, rect.y + rect.h);
	ctx.lineTo(rect.x + rect.w, rect.y + rect.h);

	ctx.moveTo(rect.x + rect.w * 0.5, rect.y + rect.h);
	ctx.lineTo(rect.x + rect.w * 0.5, rect.y + rect.h);

	ctx.moveTo(rect.x, rect.y + rect.h);
	ctx.lineTo(rect.x, rect.y + rect.h);

	ctx.moveTo(rect.x, rect.y + rect.h * 0.5);
	ctx.lineTo(rect.x, rect.y + rect.h * 0.5);

	ctx.stroke();
}

function isPointInRect (rect, x, y, offset = 0) {
	return x > rect.x - offset &&
		x < rect.x + rect.w + offset &&
		y > rect.y - offset &&
		y < rect.y + rect.h + offset;
}

function isTwoRectsIntersectOrOneUnion (rect1, rect2) {
	return (rect1.x < rect2.x + rect2.w &&
		rect1.x + rect1.w > rect2.x &&
		rect1.y < rect2.y + rect2.h &&
		rect1.y + rect1.h > rect2.y) ||
		(rect1.x >= rect2.x &&
		rect1.y >= rect2.y &&
		rect1.x + rect1.w <= rect2.x + rect2.w &&
		rect1.y + rect1.h <= rect2.y + rect2.h) ||
		(rect2.x >= rect1.x &&
		rect2.y >= rect1.y &&
		rect2.x + rect2.w <= rect1.x + rect1.w &&
		rect2.y + rect2.h <= rect1.y + rect1.h);
}

function injectEditorSettingsRefForUtil (editorSettingsRef) {
	EDITOR_SETTINGS = editorSettingsRef;
}

export {
	injectEditorSettingsRefForUtil,
	drawSelectRect,
	drawDashedRect,
	isPointInRect,
	isTwoRectsIntersectOrOneUnion
};
