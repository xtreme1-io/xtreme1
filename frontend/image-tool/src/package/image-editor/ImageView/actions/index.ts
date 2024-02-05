import Action from './Action';
import ZoomMoveAction from './ZoomMoveAction';
import SelectHoverAction from './SelectHoverAction';

export type ActionCtr = new (args: any) => Action;
export type IActionMap = { [key: string]: ActionCtr };

const Actions: IActionMap = {};

[ZoomMoveAction, SelectHoverAction].forEach((actionCtr: ActionCtr) => {
  Actions[actionCtr.prototype.actionName] = actionCtr;
});

export { SelectHoverAction, ZoomMoveAction };

export default Actions;
