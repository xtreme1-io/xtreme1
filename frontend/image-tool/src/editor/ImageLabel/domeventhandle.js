import { MODETYPE } from './util.ts';
import { StatusType } from '../type';
import { Modal } from 'ant-design-vue';
import { Event } from 'editor';

// KeyDown
export default {
    // SpaceDown
    KeySpaceDown(config, e) {
        e.preventDefault();
        config.spaceKeyIsPressed = true;
    },
    // SpaceUp
    KeySpaceUp(config, e) {
        config.spaceKeyIsPressed = false;
    },
    KeyEscDown(config, e) {
        // this.editor.state.showClassView = false;
        this.editor.showModal(false);
        Modal.destroyAll();
        this.editor.emit(Event.RESET_SELECT);

        e.preventDefault();
        e.stopPropagation();

        this.toolmanager.cancel(config);

        if (!config.isDrawing) {
            this.unSelectAll();
            return;
        }
    },
    // Enter: Finish drawing
    KeyEnterDown(config, e) {
        e.preventDefault();
        e.stopPropagation();

        this.toolmanager.done(config);
    },
    // Ctrl + Z  undo
    KeyBackDown(config, e) {
        e.preventDefault();
        if (this.editor.state.status !== StatusType.Default) {
            console.log('draw');
            this.toolmanager.back(config);
        }
    },
    // Ctrl + Shift + Z  redo
    KeyForwardDown(config, e) {
        e.preventDefault();
        if (this.editor.state.status !== StatusType.Default) {
            this.toolmanager.forward(config);
        }
    },
};
