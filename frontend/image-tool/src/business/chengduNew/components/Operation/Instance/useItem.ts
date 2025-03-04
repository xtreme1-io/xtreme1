import { useInjectEditor } from 'image-ui/context';
import { IItem, IAction, IClass } from './type';
import { AnnotateObject, Event } from 'image-editor';
import { t } from '@/lang';
import { historyStore } from '@/business/chengduNew/stores';
// import * as _ from 'lodash';

export default function useItem() {
  const editor = useInjectEditor();

  function onEdit(item: IItem) {
    const find = editor.dataManager.getObject(item.id);
    if (find) {
      if (!find._deleted) editor.selectObject(find);
      editor.emit(Event.SHOW_CLASS_INFO, find);
    }
  }

  function onDelete(item: IItem) {
    const find = editor.dataManager.getObject(item.id);
    if (!find) return;
    editor
      .showConfirm({
        title: t('image.delete-title'),
        subTitle: t('image.delete-object'),
        okText: t('image.delete'),
        cancelText: t('image.cancel'),
        okDanger: true,
      })
      .then(
        () => {
          find && editor.cmdManager.execute('delete-object', find);
          editor.emit(Event.ANNOTATE_HANDLE_DELETE, { objects: [find], type: 2 });
        },
        () => {},
      );
  }

  function onToggleVisible(item: IItem) {
    const find = editor.dataManager.getObject(item.id);
    if (find) {
      const visible = !find.showVisible;
      editor.dataManager.setAnnotatesVisible(find, visible);
      // editor.selectObject(find);
    }
    // editor.selectObject();
  }

  function onClick(
    item: IItem,
    param: { event: MouseEvent; mode: 'layer' | 'list'; list: IClass[] | IItem[] },
  ) {
    if (!item.id) return;
    const curFrame = editor.getCurrentFrame();
    if (editor.state.isHistoryView) {
      historyStore().selectedDeletedObj(item.id, curFrame.id);
      return;
    }
    const find = editor.dataManager.getObject(item.id, curFrame);
    if (!find) {
      const otherFrameObj = editor.dataManager.getObject(item.id, item.frame);
      if (otherFrameObj) editor.selectObject(otherFrameObj);
      return;
    }
    if (param.event.ctrlKey || param.event.metaKey) {
      if (find.state?.select) {
        editor.selectObject(editor.selection.filter((e) => e.uuid !== find.uuid));
      } else {
        editor.selectObject([find, ...editor.selection]);
      }
    } else if (param.event.shiftKey) {
      if (find.state?.select) {
        return editor.selectObject(editor.selection.filter((e) => e.uuid !== find.uuid));
      }
      const itemList: IItem[] = [];
      if (param.mode == 'list') {
        param.list.forEach((e) => {
          itemList.push(...e.data);
        });
      } else {
        param.list.forEach(function add(e) {
          itemList.push(e as IItem);
          e.data.forEach(add);
        });
      }
      let minIndex = Infinity;
      let maxIndex = -Infinity;
      itemList.forEach((e, i) => {
        if (e.id && (item.id == e.id || editor.selectionMap[e.id])) {
          minIndex = Math.min(minIndex, i);
          maxIndex = Math.max(maxIndex, i + 1);
        }
      });
      if (isFinite(minIndex) && isFinite(maxIndex)) {
        const objects: AnnotateObject[] = [];
        itemList.slice(minIndex, maxIndex).forEach((e) => {
          if (e.id) {
            const find = editor.dataManager.getObject(e.id, curFrame);
            if (find) objects.push(find);
          }
        });
        editor.selectObject(objects);
      }
    } else {
      editor.selectObject(find);
      editor.mainView.focusObject(find);
    }
  }

  function onAction(action: IAction, item: IItem, args: any) {
    switch (action) {
      case 'edit':
        onEdit(item);
        break;
      case 'delete':
        onDelete(item);
        break;
      case 'toggleVisible':
        onToggleVisible(item);
        break;
      case 'click':
        onClick(item, args);
        break;
    }
  }

  return {
    onAction,
  };
}
