import { useInjectBSEditor } from '../../../context';
import { IAction, IItem } from './type';
import { Const } from 'image-editor';
import { interpolateObject } from '../../../utils';

// import * as _ from 'lodash';

export default function useTrack() {
  const editor = useInjectBSEditor();

  function onAdd(item: IItem) {
    const config = interpolateObject(item.trackId, editor, item.toolType as any);
    if (!config) return;
    const object = config.object;
    editor.cmdManager.execute('add-object', object);
    object.userData.resultStatus = Const.Copied;
    editor.selectObject(object);
  }

  function onAction(action: IAction, item: IItem) {
    switch (action) {
      case 'add':
        onAdd(item);
        break;
    }
  }

  return {
    onAction,
  };
}
