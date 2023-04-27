import Editor from '../../Editor';
export default class CmdBase<T = any, D = any> {
    name: string = '';
    createTime: number = 0;
    updateTime: number = 0;
    editor: Editor;
    data: T;
    undoData: D | null = null;
    constructor(editor: Editor, data: T) {
        this.createTime = new Date().getTime();
        this.updateTime = this.createTime;
        this.data = data;
        this.editor = editor;
    }
    redo() {
        throw new Error('need implement redo method');
    }
    undo() {
        throw new Error('need implement undo method');
    }

    canMerge(cmd: CmdBase) {
        return false;
    }

    merge(cmd: CmdBase) {}
}
