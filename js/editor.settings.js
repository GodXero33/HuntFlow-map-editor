import { injectEditorSettingsRefForEditor } from "./editor.js";
import { injectEditorSettingsRefForUtil } from "./util.js";

const EDITOR_SETTINGS = {
	selector_dots_size: 15,
	colors: {
		hover: '#a0a0a0',
		select: '#007aff',
		background: '#1e1e1e'
	}
};

injectEditorSettingsRefForEditor(EDITOR_SETTINGS);
injectEditorSettingsRefForUtil(EDITOR_SETTINGS);
