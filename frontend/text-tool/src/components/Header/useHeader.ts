import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useInjectEditor } from '../../state';
import { Event, IFrame, StatusType } from 'pc-editor';
import * as _ from 'lodash';
import * as api from '../../api';
import * as locale from './lang';
import screenFull from 'screenfull';
import { Modal } from 'ant-design-vue';
// import { SideRenderView } from 'pc-render';

export default function useHeader() {
    let editor = useInjectEditor();
    let $$ = editor.bindLocale(locale);
    let { state, bsState } = editor;
    let editorState = editor.state;
    let dataIndex = ref(state.frameIndex + 1);
    let iState = reactive({
        fullScreen: false,
        dataName: '',
    });
    watch(
        () => state.frameIndex,
        () => {
            if (dataIndex.value !== state.frameIndex + 1) dataIndex.value = state.frameIndex + 1;
            updateName();
        },
    );

    onMounted(() => {
        editor.addEventListener(Event.ANNOTATE_LOADED, updateName);
    });

    let currentFrame = computed(() => {
        let { frameIndex, frames } = editor.state;
        return frames[frameIndex];
    });

    let onIndexChange = _.debounce(() => {
        console.log('change', dataIndex.value);
        if (dataIndex.value && dataIndex.value - 1 >= 0) editor.loadFrame(dataIndex.value - 1);
    }, 200);

    function onIndexBlur() {
        if (!dataIndex.value) dataIndex.value = state.frameIndex + 1;
    }
    async function onFullScreen() {
        if (iState.fullScreen) {
            await screenFull.exit();
        } else {
            await screenFull.request();
        }
        iState.fullScreen = !iState.fullScreen;
        // setTimeout(() => {
        //     editor.pc.renderViews.forEach((view) => {
        //         if (view instanceof SideRenderView) view.fitObject();
        //         view.render();
        //     });
        // }, 400);
    }

    let updateName = () => {
        let frame = editor.getCurrentFrame();
        iState.dataName = frame.jsonFile?.name || '';
    };
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

        await unlockData();
    }

    async function unlockData() {
        if (editor.state.modeConfig.name !== 'view') {
            await api.unlockRecord(editor.bsState.recordId);
        }
        closeTab();
    }

    function closeTab() {
        let win = window.open('about:blank', '_self');
        win && win.close();
    }

    let blocking = computed(() => {
        return (
            bsState.saving ||
            bsState.validing ||
            bsState.submitting ||
            bsState.modifying ||
            editorState.status === StatusType.Loading ||
            editorState.status === StatusType.Create ||
            editorState.status === StatusType.Play
        );
    });

    function onHelp() {
        editor.showModal('ModelHelp', { title: 'Help', width: 1000 }).catch(() => {});
    }

    async function onToggleValid() {
        let { frameIndex, frames } = editor.state;
        let frame = frames[frameIndex];

        bsState.validing = true;
        try {
            if (frame.dataStatus === 'INVALID') {
                await api.validData(frame.id);
                frame.dataStatus = 'VALID';
            } else {
                await api.invalidData(frame.id);
                frame.dataStatus = 'INVALID';
            }
        } catch (error: any) {
            editor.handleErr(error, 'Operation Error');
        }
        bsState.validing = false;
    }

    async function onToggleSkip() {
        let { frameIndex, frames } = editor.state;
        // frame.skipped = !frame.skipped;
        await editor.saveObject([frames[frameIndex]]);
        if (frameIndex < frames.length - 1) {
            await editor.loadFrame(frameIndex + 1);
        } else {
            editor.showMsg('warning', 'This is last data');
        }
    }
    async function onSubmit() {
        let { frameIndex, frames } = editor.state;
        let frame = frames[frameIndex];

        let objects = editor.dataManager.getFrameObject(frame.id) || [];

        let continueFlag = true;
        if (frame.dataStatus === 'VALID' && objects.length === 0) {
            await editor
                .showConfirm({
                    title: 'Tip',
                    subTitle:
                        "you don't have any annotation yet, are you sure you want to submit this data? If you can't annotate this data, you'd better mark this data as invalid. Cancel/ submit anyway",
                })
                .then(async () => {
                    // await onToggleValid();
                })
                .catch(() => {
                    continueFlag = false;
                });
        }

        if (!continueFlag) return;

        // if (frame.skipped) return;
        bsState.submitting = true;
        try {
            await editor.saveObject([frame], true);
            await api.submitData(frame.id);
            await updateDataStatus(frame);
            editor.showMsg('success', 'Submit Success');
        } catch (error: any) {
            editor.handleErr(error, 'Operation Error');
        }
        bsState.submitting = false;

        // not last frame
        if (frameIndex !== frames.length - 1) {
            editor.loadFrame(frameIndex + 1);
        } else {
            // last frame
            let next = nextNotAnnotate();
            if (next < 0) {
                editor
                    .showConfirm({
                        title: 'Well Done!',
                        subTitle: 'You have finish all the annotation!',
                        okText: 'Close and release those data',
                        centered: true,
                    })
                    .then(() => {
                        unlockData();
                    })
                    .catch(() => {});
            } else {
                editor.loadFrame(next);
            }
        }
    }

    async function updateDataStatus(frame: IFrame) {
        let statusMap = await api.getDataStatus([frame.id]);

        if (statusMap[frame.id]) {
            let status = statusMap[frame.id];
            frame.dataStatus = status.status || 'VALID';
            frame.annotationStatus = status.annotationStatus || 'NOT_ANNOTATED';
        }
    }

    function nextNotAnnotate() {
        let { frames } = editor.state;

        let frame = frames.find((e) => {
            return e.annotationStatus === 'NOT_ANNOTATED';
        });
        if (frame) return editor.getFrameIndex(frame.id);
        return -1;
    }

    async function onModify() {
        let { bsState } = editor;
        let frame = editor.getCurrentFrame();
        let config = {
            dataIds: [frame.id],
            dataType: 'SINGLE_DATA',
            datasetId: bsState.datasetId,
        };

        bsState.modifying = true;
        try {
            let recordInfo = await api.getLockRecord(bsState.datasetId);
            if (recordInfo.data && recordInfo.data.recordId) {
                editor.showMsg('warning', 'You have 1 data occupied');
                bsState.modifying = false;
                return;
            }

            let data = await api.annotateData(config);
            if (data.code === 'OK' && data.data) {
                let recordId = data.data;
                let host = location.host || location.hostname;
                let pathname = location.pathname;
                let protocol = location.protocol;
                location.href = `${protocol}//${host + pathname}?recordId=${recordId}`;
            } else {
                editor.showMsg('warning', data.message || `Operation Failed`);
            }
        } catch (error: any) {
            editor.handleErr(error, 'Operation Failed');
        }
        bsState.modifying = false;
    }

    return {
        $$,
        iState,
        currentFrame,
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
        onToggleValid,
        onToggleSkip,
        onSubmit,
        onModify,
    };
}
