import * as pageHandler from '../pages';
import { useInjectBSEditor } from '../context';
import Event from '../configs/event';
import useQuery from './useQuery';
import useToken from './useToken';
import { MsgType, StatusType } from 'image-editor';
import { setToken } from '../api/base';
import { enableEscOnFullScreen } from '../utils';
import { computed, watch } from 'vue';

export type IHandlerType = keyof typeof pageHandler;

export default function UseFlow() {
  const editor = useInjectBSEditor();
  const { bsState, state } = editor;
  const { query, iniQuery } = useQuery();
  const token = useToken();

  iniQuery();
  const mode = getMode(query);
  if (!mode || !pageHandler[mode]) {
    editor.showMsg(MsgType.error, 'invalid-query');
    return;
  }
  const handler = pageHandler[mode]();

  // console.log('UseFlow ===> query', query);
  // console.log('UseFlow ===> bsState', bsState.query);
  // console.log('UseFlow ===> token', token);
  // console.log('UseFlow ===> mode', mode);

  function handleUnload() {
    window.addEventListener('beforeunload', (event: Event) => {
      console.log('beforeunload');
      if (editor.needSave()) {
        event.preventDefault();
        // @ts-ignore
        event.returnValue = editor.t('msg-not-save');
      }
    });
  }
  function initFlowEvent() {
    editor.on(Event.FLOW_ACTION, async (action, data) => {
      if (bsState.blocking) return;
      console.log('action', action);
      handler.onAction(action, data);
    });
  }
  async function init() {
    if (!token) {
      editor.showMsg(MsgType.error, 'Not logged in');
      return;
    }
    setToken(token);
    initFlowEvent();
    handleUnload();
    enableEscOnFullScreen();
    await handler.init();
    editor.emit(Event.BUSINESS_INIT);
  }
  const blocking = computed(() => {
    return (
      bsState.doing.saving ||
      bsState.doing.submitting ||
      bsState.doing.marking ||
      bsState.doing.skip ||
      state.editorMuted ||
      state.status !== StatusType.Default
    );
  });

  watch(
    () => blocking.value,
    () => {
      bsState.blocking = blocking.value;
    },
    {
      immediate: true,
    },
  );

  return { init };
}

function getMode(query: Record<string, any>): IHandlerType {
  let mode = 'execute' as IHandlerType;
  if (query.type === 'readOnly') {
    mode = 'view';
  }
  return mode;
}
