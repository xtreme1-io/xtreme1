import { useInjectEditor } from 'image-ui/context';
import { IClass, IAction, IItem } from './type';
import { AnnotateObject, Event } from 'image-editor';
import { t } from '@/lang';

export default function useClass() {
  const editor = useInjectEditor();

  function onEdit(item: IClass) {
    const objects = getObjects(item.data);
    if (!objects || objects.length === 0) return;
    editor.selectObject(objects);
    editor.emit(Event.SHOW_CLASS_INFO, objects);
  }

  function onDelete(item: IClass) {
    const objects = getObjects(item.data);
    if (!objects || objects.length === 0) return;
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
          editor.cmdManager.execute('delete-object', objects);
          editor.emit(Event.ANNOTATE_HANDLE_DELETE, { objects, type: 2 });
        },
        () => {},
      );
  }

  function onToggleVisible(item: IClass) {
    const objects = getObjects(item.data);
    if (!objects || objects.length === 0) return;
    const visible = !item.visible;
    editor.dataManager.setAnnotatesVisible(objects, visible, true);
  }

  function getObjects(items: IItem[]) {
    return items
      .filter((e) => e.hasObject)
      .map((e) => editor.dataManager.getObject(e.id))
      .filter((e) => e) as AnnotateObject[];
  }

  function onAction(action: IAction, item: IClass) {
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
    }
  }

  return {
    onAction,
  };
}
