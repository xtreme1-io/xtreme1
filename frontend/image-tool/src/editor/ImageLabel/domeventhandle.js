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
    // Esc 取消绘制 取消正在绘制的图形  或取消 选中
    KeyEscDown(config, e) {
        // 取消弹窗
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
    // Enter 完成绘制
    KeyEnterDown(config, e) {
        e.preventDefault();
        e.stopPropagation();

        this.toolmanager.done(config);
    },
    // Ctrl + Z  撤销一步 undo
    KeyBackDown(config, e) {
        e.preventDefault();
        if (this.editor.state.status !== StatusType.Default) {
            console.log('draw');
            this.toolmanager.back(config);
        }
    },
    // Ctrl + Shift + Z 回退一步 redo
    KeyForwardDown(config, e) {
        e.preventDefault();
        if (this.editor.state.status !== StatusType.Default) {
            this.toolmanager.forward(config);
        }
    },
};
