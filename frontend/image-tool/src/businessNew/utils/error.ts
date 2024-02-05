import { Editor, BSError, MsgType } from 'image-editor';
// import Code from '../config/code';

function logErrorStack(err: BSError | Error) {
  while (err) {
    if (err instanceof BSError) {
      console.log(err);
    } else {
      console.error(err);
    }

    err = (err as any).oriError;
  }
}

export function handleError(editor: Editor, err: BSError | Error) {
  const oriError = (err as any).oriError;

  if (err instanceof BSError) {
    editor.showMsg(MsgType.error, err.message);
    if (oriError) logErrorStack(oriError);
  } else {
    console.error(err);
  }
}
