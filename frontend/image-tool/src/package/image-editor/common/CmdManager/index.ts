import CmdBase from './CmdBase';
import CMD from './cmd/index';
import Editor from '../../Editor';
import type { ICmdOption } from './cmd/index';
import { Event } from '../../configs';
import CmdGroup from './CmdGroup';
import EventEmitter from 'eventemitter3';

export type ICmdName = keyof typeof CMD;

export interface ICmdBackup {
  cmds: CmdBase[];
  index: number;
}

export default class CmdManager extends EventEmitter {
  static Cmd = CMD;
  editor: Editor;
  cmds: CmdBase[] = [];
  index: number = -1;
  max: number = 20;
  backup: ICmdBackup | undefined = undefined;
  private _group: CmdGroup | undefined = undefined;
  constructor(editor: Editor) {
    super();
    this.editor = editor;
  }

  execute<T extends ICmdName>(name: T | CmdGroup, data?: ICmdOption[T]) {
    let cmd = {} as CmdBase;
    if (name instanceof CmdGroup) {
      cmd = name;
    } else {
      const CmdCtr = CmdManager.Cmd[name];
      if (!CmdCtr) return;
      cmd = new CmdCtr(this.editor, data as any);
      cmd.name = name;
    }

    if (this._group) {
      this._group.cmds.push(cmd);
      return;
    }

    this.cmds = this.cmds.slice(0, this.index + 1);

    const last = this.cmds[this.index];
    if (last && last.canMerge(cmd)) {
      last.merge(cmd);
      last.redo();
    } else {
      cmd.redo();
      this.cmds.push(cmd);
    }

    if (this.cmds.length > this.max) {
      this.cmds = this.cmds.slice(-this.max);
    }

    this.index = this.cmds.length - 1;
    this.emit(Event.EXECUTE, { cmd, last });
  }

  addExecuteManually(cmd: CmdBase) {
    if (this._group) {
      this._group.cmds.push(cmd);
      return;
    }

    this.cmds = this.cmds.slice(0, this.index + 1);
    this.cmds.push(cmd);
    if (this.cmds.length > this.max) {
      this.cmds = this.cmds.slice(-this.max);
    }
    this.index = this.cmds.length - 1;
    this.emit(Event.EXECUTE, { cmd });
  }

  undo() {
    if (this.index < 0 || this.cmds.length === 0) return;

    const cmd = this.cmds[this.index];

    cmd.undo();

    this.index--;
    this.emit(Event.UNDO, { cmd });
  }

  redo() {
    if (this.cmds.length === 0 || this.index >= this.cmds.length - 1) return;

    const cmd = this.cmds[this.index + 1];

    cmd.redo();

    this.index++;
    this.emit(Event.REDO, { cmd });
  }

  withGroup(groupFn: () => void) {
    if (this._group) {
      groupFn();
      return;
    }

    const group = new CmdGroup(this.editor);
    this._group = group;

    let errFlag = false;
    try {
      groupFn();
    } catch (error) {
      console.log(error);
      errFlag = true;
    }

    this._group = undefined;

    if (errFlag) return;

    if (group.cmds.length > 0) this.execute(group);
  }

  reset() {
    this.cmds = [];
    this.index = -1;
    this.emit(Event.RESET);
  }

  saveHistory() {
    const backup: ICmdBackup = {
      cmds: this.cmds,
      index: this.index,
    };
    this.backup = backup;
    this.cmds = [];
    this.index = -1;
  }
  restoreHistory() {
    if (this.backup) {
      this.cmds = this.backup.cmds;
      this.index = this.backup.index;
      this.backup = undefined;
    }
  }
}
