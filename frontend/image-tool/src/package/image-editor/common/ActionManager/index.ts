import Editor from '../../Editor';
import * as Actions from './action';
import { IAction } from './define';
import { StatusType, ToolAction } from '../../types';
import { Event } from '../../configs';

export type IActionName = keyof typeof Actions;

Object.keys(Actions).forEach((name) => {
  Actions[name as IActionName].name = name;
});

export const AllActions = Object.keys(Actions) as IActionName[];

export default class ActionManager {
  editor: Editor;
  actions: Record<string, IAction>;
  currentAction: IAction | undefined = undefined;
  blockStatus: StatusType[] = [
    StatusType.Loading,
    StatusType.Confirm,
    StatusType.Modal,
    StatusType.Play,
    StatusType.Create,
  ];
  constructor(editor: Editor) {
    this.editor = editor;
    this.actions = { ...Actions };
  }

  registryAction(name: string, action: IAction) {
    this.actions[name] = action;
  }

  async execute<T extends IActionName>(name: T | T[], ...args: any[]): Promise<any> {
    let action = undefined;
    if (Array.isArray(name)) {
      action = this.getEnableAction(name);
    } else {
      action = this.actions[name] as IAction;
    }

    if (!action) return;
    const canBlocked = action.canBlocked(this.editor);
    if (this.isBlocked() && canBlocked) {
      console.log(`action ${name} blocked`);
      return;
    }

    let result;
    let preAction;
    if (action.valid(this.editor)) {
      this.editor.emit(Event.ACTION_START, name);
      console.log('action start:', action.name);
      preAction = this.currentAction;
      this.currentAction = action;
      try {
        result = await action.execute(this.editor, ...args);
      } catch (e) {
        console.error('action error:', name);
        console.error(e);
      }
      this.currentAction = preAction;
      console.log('action end:', name);
      action.end(this.editor, result);
      this.editor.emit(Event.ACTION_END, name);
    }

    return result;
  }

  isBlocked() {
    // return false;
    const { status, blocked } = this.editor.state;
    console.log(this.currentAction);
    return this.currentAction || blocked || this.blockStatus.includes(status);
  }

  getEnableAction(names: IActionName[]) {
    const config = this.editor.state.modeConfig;
    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      const action = this.actions[name] as IAction;
      if (action && config.actions[name] && action.valid(this.editor)) return action;
    }

    return undefined;
  }

  stopCurrentAction() {
    if (!this.currentAction) return;

    this.currentAction.end(this.editor, () => {});
    console.log(`stop action: ${this.currentAction.name}`);

    this.currentAction = undefined;
  }

  handleEsc() {
    const { currentDrawTool, currentEditTool } = this.editor.mainView;
    const tool = currentDrawTool || currentEditTool;
    if (tool && tool.checkAction(ToolAction.esc)) {
      tool.onAction(ToolAction.esc);
    } else if (this.currentAction) {
      this.stopCurrentAction();
    } else if (this.editor.selection.length > 0) {
      this.editor.selectObject();
    }
  }

  isActionValid(name: IActionName) {
    const action = this.actions[name] as IAction;
    if (!action) return false;

    return action.valid(this.editor);
  }
}
