import Editor from '../Editor';
import { IFrame, IObject, IFileConfig } from '../type';

export default class BusinessManager {
    editor: Editor;

    constructor(editor: Editor) {
        this.editor = editor;
    }

    async loadFrameConfig(data: IFrame): Promise<IFileConfig> {
        throw 'loadFrameConfig implement error';
    }

    async getFrameClassification(
        frame: IFrame | IFrame[],
    ): Promise<Record<string, Record<string, string>>> {
        throw 'getFrameClassification implement error';
    }

    async createAnnotation(data: {
        type: 'object' | 'position';
        data: any;
        tags: any[];
        msg: string;
    }) {
        throw 'createAnnotation implement error';
    }

    async getFrameObject(frame: IFrame | IFrame[]): Promise<{
        objectsMap: Record<string, IObject[]>;
        classificationMap: Record<string, any>;
        queryTime: string;
    }> {
        throw 'getFrameObject implement error';
    }
}
