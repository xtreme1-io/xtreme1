import hotkeys from 'hotkeys-js';
import Editor from '../../Editor';
import type { IHotkeyConfig } from './type';
import { IActionName } from '../ActionManager';
import { Event, hotkeyConfig, seriesFrameHotKey } from '../../configs';

export enum NameSpace {
  All = 'Hotkey_NameSapce_All',
}
export default class HotkeyManager {
  editor: Editor;
  hotkeyConfigs: IHotkeyConfig[];
  constructor(editor: Editor) {
    this.editor = editor;
    this.hotkeyConfigs = [...hotkeyConfig];
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
    hotkeys.deleteScope(NameSpace.All);
    hotkeys.setScope(NameSpace.All);

    const filterConfig = this.hotkeyConfigs.filter((e) => {
      return Array.isArray(e.action) ? validActions(actions, e.action) : actions[e.action];
    });
    filterConfig.forEach((config) => {
      this.bindConfig(config);
    });
    this.bindEsc();
    this.editor.emit(Event.HOTKEY);
  }

  bindEsc() {
    hotkeys('esc', (event, handler) => {
      event.preventDefault();
      console.log('esc', '--> ');
      this.editor.actionManager.handleEsc();
    });
  }

  bindConfig(config: IHotkeyConfig) {
    hotkeys(config.key, (event, handler) => {
      event.preventDefault();
      console.log(config.key, '--> action:', config.action);

      this.editor.actionManager.execute(config.action, config.key);
    });
  }

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
}
