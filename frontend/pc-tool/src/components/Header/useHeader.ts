import { computed, reactive, ref, watch } from 'vue';
import { useInjectEditor } from '../../state';
import { StatusType } from 'pc-editor';
import * as _ from 'lodash';
import * as api from '../../api';
import screenFull from 'screenfull';
export default function useHeader() {
    let editor = useInjectEditor();
    let { state, bsState } = editor;
    let editorState = editor.state;
    let dataIndex = ref(state.frameIndex + 1);
    let iState = reactive({
        fullScreen: false,
    });
    watch(
        () => state.frameIndex,
        () => {
            if (dataIndex.value !== state.frameIndex + 1) dataIndex.value = state.frameIndex + 1;
        },
    );

    let onIndexChange = _.debounce(() => {
        console.log('change', dataIndex.value);
        if (dataIndex.value && dataIndex.value - 1 >= 0) editor.loadFrame(dataIndex.value - 1);
    }, 200);

    function onIndexBlur() {
        if (!dataIndex.value) dataIndex.value = state.frameIndex + 1;
    }
    function onFullScreen() {
        if (iState.fullScreen) {
            screenFull.exit();
        } else {
            screenFull.request();
        }
        iState.fullScreen = !iState.fullScreen;
    }
    function onSave() {
        editor.saveObject();
    }

    function onPre() {
        editor.loadFrame(state.frameIndex - 1);
    }
    function onNext() {
        editor.loadFrame(state.frameIndex + 1);
    }

    async function onClose() {
        let status = '';
        if (editor.needSave()) {
            status = await editor
                .showModal('ModalConfirm', {
                    title: '',
                    closable: false,
                    data: {
                        // btns: ['ok'],
                        okText: 'Save',
                        content: 'Save Change',
                        subContent: 'Do you want to save changes?',
                    },
                })
                .then(
                    async (_status: 'discard' | 'ok') => {
                        return _status;
                    },
                    async (error) => 'cancel',
                );
        }

        if (status === 'ok') {
            await editor.saveObject();
        } else if (status === 'discard') {
            // clear save status
            editor.state.frames.forEach((e) => {
                e.needSave = false;
            });
        } else if (status === 'cancel') {
            return;
        }

        if (editor.state.modeConfig.name !== 'view') {
            await api.unlockRecord(editor.bsState.recordId);
        }

        closeTab();

        function closeTab() {
            let win = window.open('about:blank', '_self');
            win && win.close();
        }
    }

    let blocking = computed(() => {
        return (
            bsState.saving ||
            editorState.status === StatusType.Loading ||
            editorState.status === StatusType.Create ||
            editorState.status === StatusType.Play
        );
    });

    function onHelp() {
        editor.showModal('ModelHelp', { title: 'Help', width: 1000 }).catch(() => {});
    }

    return {
        iState,
        blocking,
        dataIndex,
        onIndexChange,
        onFullScreen,
        onHelp,
        onIndexBlur,
        onSave,
        onPre,
        onNext,
        onClose,
    };
}
