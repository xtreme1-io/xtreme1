import { Editor } from 'pc-editor';
import hotkeyConfig from './config/hotkey';
import * as Actions from './actions';

export function initRegistry(editor: Editor) {
    // registry kot key
    editor.hotkeyManager.registryHotkey(hotkeyConfig);
    // registry action
    Object.keys(Actions).forEach((name) => {
        editor.actionManager.registryAction(name, (Actions as any)[name]);
    });
}
