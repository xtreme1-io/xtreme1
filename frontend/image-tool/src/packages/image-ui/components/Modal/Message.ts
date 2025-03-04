import { Editor, MsgType } from '../../../image-editor';
import { message } from 'ant-design-vue';

const defaultConfig = {
  maxCount: 1,
  duration: 3,
};
message.config(defaultConfig);

export default function injectMessage(editor: Editor) {
  editor.showMsg = (type: MsgType, msg: string, config?: Object) => {
    message.config({ ...defaultConfig, ...config });
    message[type](msg);
  };
}
