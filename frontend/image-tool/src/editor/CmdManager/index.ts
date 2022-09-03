import CmdBase from './CmdBase';
import CMD from './cmd/index';
import { Editor } from '../Editor';
import type { ICmdOption } from './cmd/index';
import { EventDispatcher } from 'three';
import Event from '../config/event';
import Tool from 'src/business/chengdu/common/Tool';

export type ICmdName = keyof typeof CMD;

export default class CmdManager extends EventDispatcher {
    static Cmd = CMD;
    editor: Editor;
    tool: Tool;
    cmds: CmdBase[] = [];
    index: number = -1;
    max: number = 20;
    constructor(editor: Editor, tool: Tool) {
        super();
        this.editor = editor;
        this.tool = tool;
    }

    execute<T extends ICmdName>(name: T, data?: ICmdOption[T]) {
        let CmdCtr = CmdManager.Cmd[name];
        if (!CmdCtr) return;

        this.cmds = this.cmds.slice(0, this.index + 1);

        let cmd = new CmdCtr(this.editor, data as any, this.tool);
        cmd.name = name;

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
        if (this.index < 0 || this.cmds.length === 0) {
            this?.editor.showMsg('error', 'No record yet');
            return;
        }
        let cmd = this.cmds[this.index];
        console.log(cmd);
        cmd.undo();
        this.index--;
        console.log(this.index);
        this.dispatchEvent({ type: Event.UNDO, data: { cmd } });
    }

    redo() {
        if (this.cmds.length === 0 || this.index >= this.cmds.length - 1) {
            this?.editor.showMsg('error', 'No record yet');
            return;
        }
        console.log(this.index);
        let cmd = this.cmds[this.index + 1];

        cmd.redo();

        this.index++;
        this.dispatchEvent({ type: Event.REDO, data: { cmd } });
    }

    reset() {
        this.cmds = [];
        this.index = -1;
        this.dispatchEvent({ type: Event.RESET });
    }
}
