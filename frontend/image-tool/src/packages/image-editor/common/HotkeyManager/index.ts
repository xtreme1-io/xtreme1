import hotkeys, { Hotkeys } from 'hotkeys-js';
import Editor from '../../Editor';
import hotkeyConfig, { rectHotkey, seriesFrameHotKey } from '../../config/hotkey';
import type { IHotkeyConfig } from './type';
import { IActionName } from '../ActionManager';
import { Event } from '../../config';

// 只是用来做打印的，所以没有全局声明
declare global {
  interface Window {
    hotkeys: Hotkeys;
  }
}

window.hotkeys = hotkeys;

export default class HotkeyManager {
  editor: Editor;
  hotkeyConfigs: IHotkeyConfig[];
  constructor(editor: Editor) {
    this.editor = editor;
    this.hotkeyConfigs = [...hotkeyConfig];
    // this.initHotkey();
  }

  initHotkey() {
    hotkeyConfig.forEach((config) => {
      this.bindConfig(config);
    });
  }

  registryHotkey(configs: IHotkeyConfig<any>[]) {
    this.hotkeyConfigs = [...this.hotkeyConfigs, ...configs];
  }

  setHotKeyFromAction(actions: Record<IActionName, boolean>) {
    // hotkeys.unbind();
    hotkeys.deleteScope('all');
    hotkeys.setScope('all');

    const filterConfig = this.hotkeyConfigs.filter((e) => {
      return Array.isArray(e.action) ? validActions(actions, e.action) : actions[e.action];
    });
    filterConfig.forEach((config) => {
      this.bindConfig(config);
    });

    // 特殊 快捷键
    this.bindEsc();
    this.editor.emit(Event.HOTKEY);
  }

  bindEsc() {
    hotkeys('esc', (event, handler) => {
      event.preventDefault();
      this.editor.actionManager.handleEsc();
    });
  }

  bindConfig(config: IHotkeyConfig) {
    hotkeys(config.key, (event, handler) => {
      event.preventDefault();
      this.editor.actionManager.execute(config.action, config.key);
    });
  }
  bindRectEvent() {
    rectHotkey.forEach((config) => {
      this.bindConfig(config);
    });
  }
  unbindRectEvent() {
    rectHotkey.forEach((config) => {
      hotkeys.unbind(config.key);
    });
  }
  // 绑定连续帧快捷键事件
  bindSeriesFrameEvent() {
    seriesFrameHotKey.forEach((config) => {
      this.bindConfig(config);
    });
    this.registryHotkey(seriesFrameHotKey);
  }
}

function validActions(actionMap: Record<IActionName, boolean>, actions: IActionName[]) {
  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    if (actionMap[action]) return true;
  }

  return false;
}
// hack hotkeys 对可输入元素的判断, 对于checkbox和 radio 元素 也响应快捷键
hotkeys.filter = filter;
function filter(event: KeyboardEvent) {
  const target = (event.target || event.srcElement) as HTMLFormElement;
  const tagName = target.tagName;
  const type = target.type;
  let flag = true; // ignore: isContentEditable === 'true', <input> and <textarea> when readOnly state is false, <select>

  if (
    target.isContentEditable ||
    (((tagName === 'INPUT' && !['radio', 'checkbox'].includes(type)) ||
      tagName === 'TEXTAREA' ||
      tagName === 'SELECT') &&
      !target.readOnly)
  ) {
    flag = false;
  }
  return flag;
} // 判断摁下的键是否为某个键，返回true或者false
