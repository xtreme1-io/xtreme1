import Editor from '../../Editor';
import CmdBase from './CmdBase';

export default class CmdGroup extends CmdBase {
  cmds: CmdBase[] = [];
  constructor(editor: Editor) {
    super(editor, undefined);
  }
  redo() {
    try {
      this.cmds.forEach((e) => {
        e.redo();
      });
    } catch (error) {
      console.error(error);
    }
  }
  undo() {
    try {
      const cmds = [...this.cmds].reverse();
      cmds.forEach((e) => {
        e.undo();
      });
    } catch (error) {
      console.error(error);
    }
  }
}
