import Action from './Action';

export type ActionCtr = new (args: any) => Action;

type IActionMap = { [key: string]: ActionCtr };

const Actions: IActionMap = {};

export function registryAction<T extends Action>(name: string, action: new () => T) {
    Actions[name] = action;
}

export default Actions;
