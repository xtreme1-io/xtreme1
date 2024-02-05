import Editor from '../../../Editor';
import { define } from '../define';
import { Event } from '../../../configs';

export const toggleHelpLine = define({
  valid() {
    return true;
  },
  canBlocked: () => false,
  execute(editor: Editor) {
    const { config } = editor.state;
    config.helperLine.showLine = !config.helperLine.showLine;
  },
});
export const toggleClassTitle = define({
  valid() {
    return true;
  },
  canBlocked: () => false,
  execute(editor: Editor) {
    const { config } = editor.state;
    config.showClassTitle = !config.showClassTitle;
    if (config.showClassTitle) editor.emit(Event.DRAW);
  },
});
export const toggleClassView = define({
  valid() {
    return true;
  },
  execute(editor: Editor) {
    const { config } = editor.state;
    const selection = editor.selection;

    if (config.showClassView) {
      config.showClassView = false;
    } else if (selection.length === 1) {
      editor.emit(Event.SHOW_CLASS_INFO, selection[0]);
    }
  },
});
