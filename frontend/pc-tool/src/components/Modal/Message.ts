import { Editor, MsgType } from 'pc-editor';
import { message } from 'ant-design-vue';

message.config({
    maxCount: 1,
    duration: 3,
});

export default function injectMessage(editor: Editor) {
    editor.showMsg = (type: MsgType, msg: string) => {
        message[type](msg);
    };
}
