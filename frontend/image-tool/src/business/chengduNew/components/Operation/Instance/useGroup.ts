import { useInjectEditor } from 'image-ui/context';
import { IItem, IAction, IClass } from './type';
import { AnnotateObject, Event, GroupObject } from 'image-editor';
import { t } from '@/lang';

export default function useGroup() {
  const editor = useInjectEditor();

  function onEdit(item: IItem) {
    const find = editor.dataManager.getObject(item.id);
    if (find) {
      editor.selectObject(find);
      editor.emit(Event.SHOW_CLASS_INFO, find);
    }
  }

  function onToggleVisible(item: IItem) {
    const find = editor.dataManager.getObject(item.id) as GroupObject;
    if (find?.member.length > 0) {
      const visible = !find.showVisible;
      editor.dataManager.setAnnotatesVisible(find, visible, true);
    }
  }

  function onUnGroup(item: IItem) {
    const find = editor.dataManager.getObject(item.id) as GroupObject;
    if (find) {
      editor
        .showConfirm({
          title: t('image.confirm-title'),
          subTitle: t('image.splitGroup'),
          okText: t('image.confirm'),
          cancelText: t('image.cancel'),
          okDanger: true,
        })
        .then(
          () => {
            editor.cmdManager.execute('delete-object', find);
          },
          () => {},
        );
    }
  }

  // function onClick(item: IItem) {
  //   const ids = item.data.map((e) => e.id);
  //   ids.unshift(item.id);
  //   const objects = ids
  //     .map((id) => editor.dataManager.getObject(id))
  //     .filter((e) => e) as AnnotateObject[];
  //   if (objects && objects.length > 0) {
  //     editor.selectObject(objects);
  //     item.data.length > 0 && editor.mainView.focusObject(objects[0]);
  //   }
  // }
  function onClick(
    item: IItem,
    param: { event: MouseEvent; mode: 'layer' | 'list'; list: IClass[] | IItem[] },
  ) {
    if (!item.id) return;
    const curFrame = editor.getCurrentFrame();
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
  function onDelete(item: IItem) {
    const find = editor.dataManager.getObject(item.id) as GroupObject;
    if (!find || !find.isGroup()) return;
    const deleteObj: AnnotateObject[] = [find];
    if (find.member.length > 0) deleteObj.push(...find.member);
    editor.cmdManager.execute('delete-object', deleteObj);
  }

  function onAction(action: IAction, item: IItem, args: any) {
    switch (action) {
      case 'edit':
        onEdit(item);
        break;
      case 'toggleVisible':
        onToggleVisible(item);
        break;
      case 'delete':
        onDelete(item);
        break;
      case 'ungroup':
        onUnGroup(item);
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
