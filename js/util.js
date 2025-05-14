let EDITOR_SETTINGS = null;

function drawSelectRect (ctx, rect, color = '#ffffff') {
	ctx.save();

	ctx.strokeStyle = color;
	ctx.lineWidth = 2;
	ctx.shadowColor = '#000000';
	ctx.shadowBlur = 5;

	ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);

	ctx.lineWidth = EDITOR_SETTINGS.selector_dots_size;
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

function injectEditorSettingsRefForUtil (editorSettingsRef) {
	EDITOR_SETTINGS = editorSettingsRef;
}

export {
	injectEditorSettingsRefForUtil,
	drawSelectRect
};
