let EDITOR_SETTINGS = null;

function drawDashedRect (ctx, rect, color = '#ffffff', scale = 1, lineSize = 5) {
	ctx.save();

	ctx.strokeStyle = color;
	ctx.lineWidth = lineSize / scale;

	ctx.setLineDash([lineSize / scale, lineSize * 2 / scale]);
	ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);

	ctx.restore();
}

function drawSelectRect (ctx, rect, color = '#ffffff', scale = 1, lineSize = 5) {
	ctx.save();

	ctx.strokeStyle = color;
	ctx.lineWidth = lineSize / scale;
	ctx.shadowColor = '#000000';
	ctx.shadowBlur = lineSize;

	ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);

	ctx.restore();
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
