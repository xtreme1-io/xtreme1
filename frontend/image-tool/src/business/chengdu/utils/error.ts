import Tool from '../common/Tool';
import BSError from '../common/BSError';

export function handleError(tool: Tool, err: BSError | Error) {
    let { editor } = tool;

    if ((err as any).oriError) console.log('oriError', (err as any).oriError);
    editor.showMsg('error', err.message);

    // if(err instanceof BSError){
    //     editor.showMsg('error',err.message)
    // }else{
    //     editor.showMsg('error',err)
    // }
}
