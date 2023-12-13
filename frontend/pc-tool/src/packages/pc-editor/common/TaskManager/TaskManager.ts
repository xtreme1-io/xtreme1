import { AnnotateObject } from 'pc-render';
import Editor from '../../Editor';
import CreateTask from './create';

export default class TaskManager {
    editor: Editor;
    createTask: CreateTask;
    timer: number = 0;
    constructor(editor: Editor) {
        this.editor = editor;
        this.createTask = new CreateTask(editor);
    }
}
