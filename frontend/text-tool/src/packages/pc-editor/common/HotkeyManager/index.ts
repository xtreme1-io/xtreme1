import hotkeys from 'hotkeys-js';
import Editor from '../../Editor';
import hotkeyConfig from '../../config/hotkey';
import type { IHotkeyConfig } from './type';
import { IActionName } from '../ActionManager';

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
        hotkeys.unbind();

        let filterConfig = this.hotkeyConfigs.filter((e) => {
            return Array.isArray(e.action) ? validActions(actions, e.action) : actions[e.action];
        });
        filterConfig.forEach((config) => {
            this.bindConfig(config);
        });

        this.bindEsc();
    }

    bindEsc() {
        hotkeys('esc', (event, handler) => {
            event.preventDefault();
            console.log('esc', '--> ');
            this.editor.actionManager.handleEsc();
        });
    }

    bindTab() {
        hotkeys('tab', (event, handler) => {
            event.preventDefault();
            console.log('tab', '--> ');
            this.editor.actionManager.handleTab();
        });
    }

    bindConfig(config: IHotkeyConfig) {
        hotkeys(config.key, (event, handler) => {
            event.preventDefault();
            console.log(config.key, '--> action:', config.action);

            if (config.viewType) {
                if (this.editor.activeView && this.editor.activeView instanceof config.viewType) {
                    this.editor.actionManager.execute(config.action);
                }
            } else {
                this.editor.actionManager.execute(config.action);
            }
        });
    }
}

function validActions(actionMap: Record<IActionName, boolean>, actions: IActionName[]) {
    for (let i = 0; i < actions.length; i++) {
        let action = actions[i];
        if (actionMap[action]) return true;
    }

    return false;
}
