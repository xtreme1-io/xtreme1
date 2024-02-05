import { reactive, ref } from 'vue';
import { useInjectBSEditor } from '../../../context';
import { IState } from './type';
import vueEvent from 'image-ui/vueEvent';
import { Event } from 'image-editor';
import useList from './useList';

export default function useResults() {
  const editor = useInjectBSEditor();

  const domRef = ref<HTMLDivElement>();
  const resultState = reactive<IState>({
    list: [],
    objectN: 0,
    updateListFlag: true,
    updateSelectFlag: true,
    selectMap: {},
    activeClass: [],
  });
  const { onSelect, onUpdateList, update } = useList(resultState, domRef);

  // *****hook******
  vueEvent(editor, Event.FRAME_CHANGE, onUpdateList);
  vueEvent(editor, Event.ANNOTATE_ADD, onUpdateList);
  // vueEvent(editor, Event.ANNOTATE_LOAD, onUpdateList);
  vueEvent(editor, Event.ANNOTATE_REMOVE, onUpdateList);
  // vueEvent(editor, Event.TRACK_OBJECT_CHANGE, onUpdateList);
  vueEvent(editor, Event.ANNOTATE_CHANGE, onUpdateList);
  vueEvent(editor, Event.ANNOTATE_VISIBLE, onUpdateList);
  vueEvent(editor, Event.SELECT, onSelect);

  return { resultState, domRef, onUpdateList };
}
