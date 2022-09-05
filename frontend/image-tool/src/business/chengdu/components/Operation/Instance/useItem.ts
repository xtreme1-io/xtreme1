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

    // 单独切换某一个形状
    function onToggleVisible(item: IItem) {
        // 先判断这个形状是否被过滤，再判断其是否可见
        // -- 如果被过滤掉，则 visible 始终为 false
        // -- 否则，执行后面的 !visible
        // -- 一般来说，这个用不着，其 父级 控制类的切换那里已经处理了，不存在单独对某个形状的过滤
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
