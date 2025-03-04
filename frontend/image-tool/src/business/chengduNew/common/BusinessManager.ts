import Editor from './Editor';
import * as api from '../api';
import { BusinessManager as BaseBusinessManager, IDataResource, IFrame } from 'image-editor';
import { t } from '@/lang';

export default class BusinessManager extends BaseBusinessManager {
  declare editor: Editor;
  constructor(editor: Editor) {
    super(editor);
    this.editor = editor;
  }
  async loadAnnotators(force?: boolean) {
    const bsState = this.editor.bsState;
    if ((bsState.annotatorList.length <= 0 && bsState.stage.type === 'REVIEW') || force === true) {
      const list = await api.getAssigneeAnnotator(bsState.taskId);
      bsState.annotatorList = [
        { name: t('image.all'), value: 'ALL' },
        ...list.map((l: any) => {
          return {
            name: l.name,
            value: +l.value,
          };
        }),
      ];
    }
  }
  async loadDataResource(frame: IFrame): Promise<IDataResource> {
    const { bsState } = this.editor;

    const { config: res } = await api.getDataFile(frame.id + '', bsState.datasetId);
    const config: IDataResource = {
      ...res,
      time: Date.now(),
    };
    return config;
  }
}
