import { Editor } from '../Editor';
import * as Actions from './action';
import { IAction } from './type';
import { StatusType } from '../type';

export type IActionName = keyof typeof Actions;

Object.keys(Actions).forEach((name) => {
    Actions[name as IActionName].name = name;
});
export let AllActions = Object.keys(Actions) as IActionName[];

interface IActionArgs {
    [key: string]: any;
}

export default class ActionManager {
    editor: Editor;
    actions: Record<string, IAction>;
    currentAction: IAction | null = null;
    constructor(editor: Editor) {
        this.editor = editor;
        this.actions = { ...Actions };
    }

    registryAction(name: string, action: IAction) {
        this.actions[name] = action;
    }

    async execute<T extends IActionName>(name: T | T[], args?: IActionArgs[T]): Promise<any> {
        let action = null;
        if (Array.isArray(name)) {
            action = this.getEnableAction(name);
        } else {
            action = this.actions[name] as IAction;
        }

        if (!action) return;

        if (this.isBlocked()) {
            console.log(`action ${name} blocked`);
            return;
        }

        let result;
        if (action.valid(this.editor)) {
            this.currentAction = action;

            const { showKeyboard } = this.editor.state;
            if (showKeyboard) {
                this.currentAction = null;
                return;
            }

            try {
                result = await action.execute(this.editor, args);
            } catch (e) {
                console.error('action error:', name);
                console.error(e);
            }
            this.currentAction = null;
            action.end(this.editor);
        }

        return result;
    }

    isBlocked() {
        return this.currentAction || this.editor.state.status !== StatusType.Default;
    }

    getEnableAction(names: IActionName[]) {
        let config = this.editor.state.modeConfig;
        for (let i = 0; i < names.length; i++) {
            let name = names[i];
            let action = this.actions[name] as IAction;
            if (action && config.actions[name] && action.valid(this.editor)) return action;
        }

        return null;
    }

    stopCurrentAction() {
        if (!this.currentAction) return;

        this.currentAction.end(this.editor);
        console.log(`stop action: ${this.currentAction.name}`);

        this.currentAction = null;
    }

    handleEsc() {
        if (this.currentAction) {
            this.stopCurrentAction();
        }
    }

    handleTab() {}

    isActionValid(name: IActionName) {
        let action = this.actions[name] as IAction;
        if (!action) return false;

        return action.valid(this.editor);
    }
}
