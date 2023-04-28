import Editor from '../Editor';
import BSError from '../common/BSError';
import Code from '../config/code';

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

function handleCode(editor: Editor, code: string) {
    let msg = '';
    switch (code) {
        case Code.NETWORK_ERROR:
            msg = editor.lang('network-error');
            break;
        case Code.LOGIN_INVALID:
            msg = editor.lang('login-invalid');
            break;
    }

    editor.showMsg('error', msg || editor.lang('unknown-error'));
}

export function handleError(editor: Editor, err: BSError | Error) {
    let oriError = (err as any).oriError;

    if (err instanceof BSError) {
        if (err.code) {
            handleCode(editor, err.code);
        } else {
            editor.showMsg('error', err.message || editor.lang('unknown-error'));
        }
        if (oriError) logErrorStack(oriError);
    } else {
        console.error(err);
    }
}
