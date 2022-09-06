import { useInjectEditor } from '../../../../../editor/inject';
import { IItem } from './type';
import { Event as EditorEvent } from '../../../../../editor';
import * as _ from 'lodash';

export default function useItem() {
    let editor = useInjectEditor();

    function onEdit(item: IItem) {
        let find = editor.tool?.shapes.getItemById(item.id);

        if (find) {
            editor.emit(EditorEvent.SHOW_CLASS_INFO, {
                data: { object: find },
            });
        }
    }

    function onDelete(item: IItem) {
        editor.showConfirm({ title: 'Delete', subTitle: 'Delete Objects?' }).then(
            () => {
                editor.cmdManager.execute('delete-object', {
                    object: editor.tool?.toJSON().filter((record: any) => record.uuid === item.id),
                    id: item.id,
                });
                editor.tool?.removeById(item.id);
            },
            () => {},
        );
    }

    function onToggleVisible(item: IItem) {
        let visible = item.filterVisible && !item.visible;
        item.visible = visible;

        editor.setVisible([item.id], visible);
    }

    function onAnnotation(item: IItem): any {}

    return {
        onEdit,
        onDelete,
        onToggleVisible,
        onAnnotation,
    };
}
