import { useInjectEditor } from 'image-ui/context';
import { IAction, IObjectItem } from './type';
import { Event } from 'image-editor';

export default function useObjectItem() {
  const editor = useInjectEditor();

  function onEdit(item: IObjectItem) {
    const find = editor.dataManager.getObject(item.id);
    if (find) {
      editor.selectObject(find);
      editor.emit(Event.SHOW_CLASS_INFO, find);
    }
  }
  function onDelete(item: IObjectItem) {
    const find = editor.dataManager.getObject(item.id);
    if (!find) return;
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
          find && editor.cmdManager.execute('delete-object', find);
          editor.emit(Event.ANNOTATE_HANDLE_DELETE, { objects: [find], type: 2 });
        },
        () => {},
      );
  }
  function onToggleVisible(item: IObjectItem) {
    const find = editor.dataManager.getObject(item.id);
    if (find) {
      const visible = !find.showVisible;
      editor.dataManager.setAnnotatesVisible(find, visible);
    }
  }
  function onClick(item: IObjectItem, mult?: boolean) {
    if (!item.id) return;

    const curFrame = editor.getCurrentFrame();
    const find = editor.dataManager.getObject(item.id, item.frame || curFrame);
    if (!find) return;
    if (mult) {
      if (find.state?.select) {
        editor.selectObject(editor.selection.filter((e) => e.uuid !== find.uuid));
      } else {
        editor.selectObject([find, ...editor.selection]);
      }
    } else {
      editor.selectObject(find);
    }
  }
  function onAction(action: IAction, item: IObjectItem, args: any) {
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
        onClick(item, args);
        break;
    }
  }

  return { onAction };
}
