import hotkeys from 'hotkeys-js';
import { Editor } from '../Editor';
import hotkeyConfig from '../config/hotkey'; // 引入快捷键配置文件。默认配置
import type { IHotkeyConfig } from './type';
import { IActionName } from '../ActionManager';

hotkeys('*', function (event, handler) {
    // Prevent the default refresh event under WINDOWS system
    console.log('keydown');
});

// type IActionName = any;

export default class HotkeyManager {
    editor: Editor;
    hotkeyConfigs: IHotkeyConfig[];
    constructor(editor: Editor) {
        this.editor = editor;
        this.hotkeyConfigs = [...hotkeyConfig];
        this.initHotkey();
    }
    // 初始化快捷键
    initHotkey() {
        // 从配置文件读取
        hotkeyConfig.forEach((config) => {
            this.bindConfig(config);
        });
    }
    // 注册快捷键
    registryHotkey(configs: IHotkeyConfig<any>[]) {
        this.hotkeyConfigs = [...this.hotkeyConfigs, ...configs];
    }
    // 设置快捷键方法?
    setHotKeyFromAction(actions: Record<IActionName, boolean>) {
        // 先解绑
        hotkeys.unbind();

        let filterConfig = this.hotkeyConfigs.filter((e) => {
            // 在配置文件里过滤出 传入的actions 的配置
            return Array.isArray(e.action) ? validActions(actions, e.action) : actions[e.action];
        });
        filterConfig.forEach((config) => {
            this.bindConfig(config);
        });

        // 特殊 快捷键
        this.bindEsc();
        // this.bindTab();
    }

    bindEsc() {
        hotkeys('esc', (event, handler) => {
            event.preventDefault();
            this.editor.actionManager.handleEsc();
        });
    }

    bindTab() {
        hotkeys('tab', (event, handler) => {
            event.preventDefault();
            this.editor.actionManager.handleTab();
        });
    }
    // 绑定快捷键
    bindConfig(config: IHotkeyConfig) {
        hotkeys(config.key, (event, handler) => {
            event.preventDefault();
            this.editor.actionManager.execute(config.action, config?.args);
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
