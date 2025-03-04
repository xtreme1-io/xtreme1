import _ from 'lodash';
import Editor from '../common/Editor';
import { ICommentItem } from '../type';

export function convertComment2Annotate(objects: any, editor: Editor): ICommentItem[] {
    const result = _.cloneDeep(objects);
    return result;
}

export function convertAnnotate2Comment(annotates: any) {
    return annotates;
}
