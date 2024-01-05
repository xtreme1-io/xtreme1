import EventEmitter from 'eventemitter3';
import Action from './actions/Action';
import Actions, { ActionCtr } from './actions';

export default class View extends EventEmitter {
  // plugin action
  actions: string[] = [];
  actionMap: { [key: string]: Action } = {};
  constructor() {
    super();
  }

  getAction(name: string) {
    return this.actionMap[name];
  }
  addActions(actionNames: string[]) {
    actionNames.forEach((name) => {
      if (this.actionMap[name]) return;
      let Ctr = Actions[name] as ActionCtr;
      if (!Ctr) return;
      let action: Action = new Ctr(this);
      try {
        action.init();
      } catch (error) {
        console.error(error);
      }
      this.actionMap[name] = action;
      this.actions.push(name);
    });
  }
  removeActions(actionNames: string[]) {
    actionNames.forEach((name) => {
      let action = this.actionMap[name];
      if (!action) return;
      try {
        action.destroy();
      } catch (error) {
        console.error(error);
      }
      this.actions = this.actions.filter((e) => e !== name);
      delete this.actionMap[name];
    });
  }
}
