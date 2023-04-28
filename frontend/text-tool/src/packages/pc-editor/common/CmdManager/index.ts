import CmdBase from './CmdBase';
import CMD from './cmd/index';
import Editor from '../../Editor';
import type { ICmdOption } from './cmd/index';
import * as THREE from 'three';
import Event from '../../config/event';
import CmdGroup from './CmdGroup';

export type ICmdName = keyof typeof CMD;

export default class CmdManager extends THREE.EventDispatcher {
    static Cmd = CMD;
    editor: Editor;
    cmds: CmdBase[] = [];
    index: number = -1;
    max: number = 20;
    private _group: CmdGroup | null = null;
    constructor(editor: Editor) {
        super();
        this.editor = editor;
    }

    execute<T extends ICmdName>(name: T | CmdGroup, data?: ICmdOption[T]) {
        let cmd = {} as CmdBase;
        if (name instanceof CmdGroup) {
            cmd = name;
        } else {
            let CmdCtr = CmdManager.Cmd[name];
            if (!CmdCtr) return;
            cmd = new CmdCtr(this.editor, data as any);
            cmd.name = name;
        }

        if (this._group) {
            this._group.cmds.push(cmd);
            return;
        }

        this.cmds = this.cmds.slice(0, this.index + 1);

        let last = this.cmds[this.index];
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
        this.dispatchEvent({ type: Event.EXECUTE, data: { cmd, last } });
    }

    undo() {
        if (this.index < 0 || this.cmds.length === 0) return;

        let cmd = this.cmds[this.index];

        cmd.undo();

        this.index--;
        this.dispatchEvent({ type: Event.UNDO, data: { cmd } });
    }

    redo() {
        if (this.cmds.length === 0 || this.index >= this.cmds.length - 1) return;

        let cmd = this.cmds[this.index + 1];

        cmd.redo();

        this.index++;
        this.dispatchEvent({ type: Event.REDO, data: { cmd } });
    }

    withGroup(groupFn: () => void) {
        // handle nested withGroup
        if (this._group) {
            groupFn();
            return;
        }

        let group = new CmdGroup(this.editor);
        this._group = group;

        let errFlag = false;
        try {
            groupFn();
        } catch (error) {
            console.log(error);
            errFlag = true;
        }

        this._group = null;

        if (errFlag) return;

        if (group.cmds.length > 0) this.execute(group);
    }

    reset() {
        this.cmds = [];
        this.index = -1;
        this.dispatchEvent({ type: Event.RESET });
    }
}
