import { Editor, defineAction } from 'pc-editor';
import Event from '../config/event';

export const flowSave = defineAction({
    valid(editor: Editor) {
        return true;
    },
    execute(editor: Editor) {
        editor.dispatchEvent({ type: Event.FLOW_ACTION, data: 'save' });
    },
});
