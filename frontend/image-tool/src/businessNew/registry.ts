import Editor from './common/Editor';
import hotkeyConfig from './configs/hotkey';
import * as Actions from './actions';

export function initRegistry(editor: Editor) {
  editor.hotkeyManager.registryHotkey(hotkeyConfig);
  Object.keys(Actions).forEach((name) => {
    editor.actionManager.registryAction(name, (Actions as any)[name]);
  });
}
