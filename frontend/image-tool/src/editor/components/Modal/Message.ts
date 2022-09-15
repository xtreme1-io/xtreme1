import { Editor, MsgType } from 'editor';
import { message } from 'ant-design-vue';

message.config({
    maxCount: 1,
    duration: 2,
});

export default function injectMessage(editor: Editor) {
    editor.showMsg = (type: MsgType, msg: string) => {
        message[type](msg);
    };
}
