import { useInjectEditor } from '../../state';
import { IItem } from './type';
import { AnnotateObject } from 'pc-render';
import { Event as EditorEvent } from 'pc-editor';
import * as _ from 'lodash';

export default function useItem() {
    let editor = useInjectEditor();
    let pc = editor.pc;

    function onAnnotation(item: IItem) {
        // if (item.annotateType !== '3d') return;
        // let objects = pc.getAnnotate3D();
        // let find = _.find(objects, (box) => {
        //     return box.uuid === item.id;
        // });
        // if (find) {
        //     editor.actionManager.execute('createAnnotation', { object: find });
        // }
    }

    function onEdit(item: IItem) {
        let config = editor.state.config;
        let objects = item.annotateType === '3d' ? pc.getAnnotate3D() : pc.getAnnotate2D();
        let find = _.find(objects, (box: AnnotateObject) => {
            return box.uuid === item.id;
        }) as AnnotateObject;

        if (find) {
            config.showClassView = true;
            editor.dispatchEvent({ type: EditorEvent.SHOW_CLASS_INFO, data: { object: find } });
        }
    }

    function onDelete(item: IItem) {
        let objects = item.annotateType === '3d' ? pc.getAnnotate3D() : pc.getAnnotate2D();
        let find = _.find(objects, (box: AnnotateObject) => {
            return box.uuid === item.id;
        }) as AnnotateObject;

        if (find) {
            editor.cmdManager.execute('delete-object', [{ objects: [find] }]);
        }
    }

    function onToggleVisible(item: IItem) {
        let objects = item.annotateType === '3d' ? pc.getAnnotate3D() : pc.getAnnotate2D();

        let find = _.find(objects, (box: AnnotateObject) => {
            return box.uuid === item.id;
        }) as AnnotateObject;

        if (find) {
            editor.cmdManager.execute('toggle-visible', { objects: find, visible: !item.visible });
            if (!item.visible) editor.cmdManager.execute('select-object', find);
        }
    }

    return {
        onAnnotation,
        onEdit,
        onDelete,
        onToggleVisible,
    };
}
