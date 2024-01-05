import { useInjectEditor } from 'image-ui/context';
import { IAction, IClassItem, IObjectItem } from './type';
import { AnnotateObject, Event } from 'image-editor';

export default function useClassItem() {
  const editor = useInjectEditor();

  function onEdit(item: IClassItem) {
    const objects = getObjects(item.data);
    if (objects.length > 0) {
      editor.selectObject(objects);
      editor.emit(Event.SHOW_CLASS_INFO, objects);
    }
  }
  function onDelete(item: IClassItem) {
    const objects = getObjects(item.data);
    if (objects.length > 0) {
      editor
        .showConfirm({
          title: editor.lang('delete-title'),
          subTitle: editor.lang('delete-object'),
          okText: editor.lang('delete'),
          cancelText: editor.lang('cancel'),
          okDanger: true,
        })
        .then(
          () => {
            editor.cmdManager.withGroup(() => {
              editor.cmdManager.execute('delete-object', objects);
            });
            editor.emit(Event.ANNOTATE_HANDLE_DELETE, { objects, type: 2 });
          },
          () => {},
        );
    }
  }
  function onToggleVisible(item: IClassItem) {
    const objects = getObjects(item.data);
    if (objects.length > 0) {
      const visible = !item.visible;
      editor.dataManager.setAnnotatesVisible(objects, visible);
    }
  }

  function getObjects(items: IObjectItem[]) {
    const frame = editor.getCurrentFrame();
    return items
      .filter((e) => frame && e.frame?.id === frame.id)
      .map((e) => editor.dataManager.getObject(e.id))
      .filter((e) => e) as AnnotateObject[];
  }
  function onAction(action: IAction, item: IClassItem, args: any) {
    console.log('item action', action);
    switch (action) {
      case IAction.edit:
        onEdit(item);
        break;
      case IAction.delete:
        onDelete(item);
        break;
      case IAction.toggleVisible:
        onToggleVisible(item);
        break;
      case IAction.click:
        // onClick(item);
        break;
    }
  }

  return {
    onAction,
  };
}
