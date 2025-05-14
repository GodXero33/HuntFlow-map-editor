import { injectEditorSettingsRefForEditor } from "./editor.js";
import { injectEditorSettingsRefForUtil } from "./util.js";

const EDITOR_SETTINGS = {
	selector_dots_size: 15
};

injectEditorSettingsRefForEditor(EDITOR_SETTINGS);
injectEditorSettingsRefForUtil(EDITOR_SETTINGS);
