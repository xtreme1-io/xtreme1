import Editor from '../chengduNew/common/Editor';
import hotkeyConfig from './config/hotkey';
import * as Actions from './actions';

export function initRegistry(editor: Editor) {
  // 注册快捷键
  editor.hotkeyManager.registryHotkey(hotkeyConfig);
  // 注册action
  Object.keys(Actions).forEach((name) => {
    editor.actionManager.registryAction(name, (Actions as any)[name]);
  });
}
