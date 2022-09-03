import { UITypeEnum } from '../../../enum/UITypeEnum';
import { Editor } from '../../Editor';
import { define } from '../define';

export const translate = define({
    valid() {
        return true;
    },
    execute(editor: Editor, params) {
        // console.log('params', params);
        // console.log(editor);
        const selectedShape = editor?.tool?.selectedShape;
        if (!selectedShape) return;

        // const shapeType = editor?.tool?.selectedShape?.type;
        // const currentTool = tools[shapeType];
        const currentTool = editor?.tool?.toolmanager?.currentTool;
        const toolsList = [UITypeEnum.interactive];

        const mode = editor?.tool?.mode;
        if (mode == 'edit' && !toolsList.includes(currentTool?.name)) {
            selectedShape.translate(params.direction, params.distance);
        }
    },
});
