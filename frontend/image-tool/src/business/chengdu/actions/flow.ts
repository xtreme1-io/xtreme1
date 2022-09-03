import { Editor, defineAction } from 'editor';
import Event from '../config/event';

export const flowHung = defineAction({
    valid(editor: Editor) {
        return true;
    },
    execute(editor: Editor) {
        editor.dispatchEvent({ type: Event.FLOW_ACTION, data: 'hung' });
    },
});

export const flowReject = defineAction({
    valid(editor: Editor) {
        return true;
    },
    execute(editor: Editor) {
        editor.dispatchEvent({ type: Event.FLOW_ACTION, data: 'reject' });
    },
});

export const flowSubmit = defineAction({
    valid(editor: Editor) {
        return true;
    },
    execute(editor: Editor) {
        editor.dispatchEvent({ type: Event.FLOW_ACTION, data: 'submit' });
    },
});

export const flowSubmitExit = defineAction({
    valid(editor: Editor) {
        return true;
    },
    execute(editor: Editor) {
        editor.dispatchEvent({ type: Event.FLOW_ACTION, data: 'submitExit' });
    },
});

export const flowSave = defineAction({
    valid(editor: Editor) {
        return true;
    },
    execute(editor: Editor) {
        editor.dispatchEvent({ type: Event.FLOW_ACTION, data: 'save' });
    },
});

export const flowPass = defineAction({
    valid(editor: Editor) {
        return true;
    },
    execute(editor: Editor) {
        editor.dispatchEvent({ type: Event.FLOW_ACTION, data: 'pass' });
    },
});

export const flowEdit = defineAction({
    valid(editor: Editor) {
        return true;
    },
    execute(editor: Editor) {
        editor.dispatchEvent({ type: Event.FLOW_ACTION, data: 'edit' });
    },
});
