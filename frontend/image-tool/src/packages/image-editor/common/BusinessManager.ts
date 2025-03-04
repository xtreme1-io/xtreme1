import Editor from '../Editor';
import { IFrame, IDataResource, IUserData } from '../types';

export default class BusinessManager {
  editor: Editor;

  constructor(editor: Editor) {
    this.editor = editor;
  }

  async loadDataResource(data: IFrame): Promise<IDataResource> {
    throw 'loadDataResource implement error';
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
    objectsMap: Record<string, IUserData[]>;
    queryTime: string;
  }> {
    throw 'getFrameObject implement error';
  }
}
