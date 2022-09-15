import { computed, reactive, ref, watch, createVNode } from 'vue';
import { message } from 'ant-design-vue';
import { useInjectTool } from '../../state';
import { StatusType, Event } from 'editor';
import * as _ from 'lodash';
import * as api from '../../api';
import { FilterEnum } from '../Operation/Instance/type';
import { ModalConfirmCustom } from '../../utils';
import { ValidStatus, AnnotateStatus } from '../../../../editor/type';

export default function useHeader() {
    let tool = useInjectTool();
    let state = tool.state;
    let editor = tool.editor;
    let editorState = editor.state;
    let dataIndex = ref(state.dataIndex + 1);
    watch(
        () => state.dataIndex,
        () => {
            if (dataIndex.value !== state.dataIndex + 1) dataIndex.value = state.dataIndex + 1;
        },
    );

    let onIndexChange = _.debounce(() => {
        // console.log('change', dataIndex.value);
        if (dataIndex.value && dataIndex.value - 1 >= 0) tool.loadData(dataIndex.value - 1);
    }, 200);

    function onIndexBlur() {
        if (!dataIndex.value) dataIndex.value = state.dataIndex + 1;
    }
    async function onSave() {
        await tool.saveObject();
    }

    async function onPre() {
        editorState.showClassView = false;
        if (tool.needSave()) {
            editor
                .showWarning({
                    title: 'Warning',
                    subTitle: 'Please save the results before switching data',
                })
                .then(
                    async () => {},
                    async () => {},
                );
        } else {
            if (state.dataIndex > 0) {
                editor.emit(Event.IMAGE_CHANGE);
                state.showVerify = false;
                tool.loadData(state.dataIndex - 1);
            }
        }
    }
    function onNext() {
        editorState.showClassView = false;
        if (tool.needSave()) {
            editor
                .showWarning({
                    title: 'Warning',
                    subTitle: 'Please save the results before switching data',
                })
                .then(
                    async () => {},
                    async () => {},
                );
        } else {
            console.log(state.dataIndex);
            if (state.dataIndex < state.dataList.length - 1) {
                editor.emit(Event.IMAGE_CHANGE);
                state.showVerify = false;
                tool.loadData(state.dataIndex + 1);
            }
        }
    }

    async function saveChange() {
        if (tool.needSave()) {
            await editor
                .showConfirm({ title: 'Save Change', subTitle: 'Do you want to save changes?' })
                .then(
                    async () => {
                        await tool.saveObject();
                    },
                    async () => {},
                );
        }
    }
    async function onClose() {
        if (editor.state.mode !== 'view') {
            await saveChange();
            //  has error
            if (tool.state.showVerify) {
                return;
            }
            await api.unlockRecord(tool.state.recordId);
        }
        closeTab();
        function closeTab() {
            let win = window.open('about:blank', '_self');
            win && win.close();
        }
    }

    async function onMark(markType: string) {
        try {
            const dataId = state.dataList[0].dataId;
            if (markType == ValidStatus.INVALID) {
                await api.setInvalid(dataId);
                await setDataStatus();
                return ValidStatus.INVALID;
            } else {
                await api.setValid(dataId);
                await setDataStatus();
                return ValidStatus.VALID;
            }
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async function onSubmit() {
        console.log('onSubmit', tool, editor);
        console.log(state.dataList[state.dataIndex]);

        const current = state.dataList[state.dataIndex];
        const { annotationStatus, needSave } = current;
        const hasAnnotated = annotationStatus == AnnotateStatus.ANNOTATED || needSave;
        // const isAnnotated = editorState.isAnnotated;
        // const hasAnnotated = annotationStatus == AnnotateStatus.ANNOTATED || needSave || isAnnotated;

        await onSave();

        const validStatus = editorState.validStatus;
        if (validStatus == ValidStatus.INVALID) {
            await handleSubmit();
            await switchData();
        } else if (validStatus == ValidStatus.VALID) {
            if (hasAnnotated) {
                // no empty
                await handleSubmit();
                await switchData();
            } else {
                // empty
                ModalConfirmCustom({
                    title: 'Reminder',
                    content: createVNode(
                        'div',
                        null,
                        `you don't have any annotation yet, are you sure you want to submit this data? If you can't annotate this data, you'd better mark this data as invaild.`,
                    ),
                    okText: 'submit anyway',
                    okButtonProps: {
                        type: 'primary',
                    },
                    onOk: async () => {
                        await handleSubmit();
                        await switchData();
                    },
                });
            }
        }
        function switchData() {
            if (state.dataIndex < state.dataList.length - 1) {
                // not last
                editor.emit(Event.IMAGE_CHANGE);
                state.showVerify = false;
                tool.loadData(state.dataIndex + 1);
            } else {
                // last
                // -- is Not_Annotated
                console.log('all dataList: ', state.dataList);
                const notAnnotateIndex = state.dataList.findIndex((item) => {
                    console.log(item);
                    return item.annotationStatus == AnnotateStatus.NOT_ANNOTATED;
                });
                console.log('Not_Annotated index', notAnnotateIndex);
                if (notAnnotateIndex != -1) {
                    // NOT_Annotated -- switch to notAnnotateIndex
                    editor.emit(Event.IMAGE_CHANGE);
                    state.showVerify = false;
                    tool.loadData(notAnnotateIndex);
                } else {
                    // All Annotated
                    ModalConfirmCustom({
                        title: 'Reminder',
                        content: createVNode('div', null, [
                            createVNode('div', null, 'Well Done!'),
                            createVNode('div', null, 'You have finish all the annotation!'),
                        ]),
                        okText: 'Close and release those data',
                        okButtonProps: {
                            type: 'primary',
                        },
                        cancelButtonProps: {
                            style: {
                                display: 'none',
                            },
                        },
                        onOk: async () => {
                            // unlock & close
                            await api.unlockRecord(tool.state.recordId);
                            closeTab();
                            function closeTab() {
                                let win = window.open('about:blank', '_self');
                                win && win.close();
                            }
                        },
                    });
                }
            }
        }
    }
    async function handleSubmit() {
        try {
            const dataId = state.dataList[0].dataId;
            await api.submit(dataId);
            await setDataStatus();
        } catch (error) {
            console.log(error);
        }
    }
    async function setDataStatus() {
        const dataId = state.dataList[0].dataId;
        const res = await api.getDataStatusByIds(dataId);
        console.log('setDataStatus', res);

        state.dataList[state.dataIndex].validStatus = res.status;
        state.dataList[state.dataIndex].annotationStatus = res.annotationStatus;
    }

    async function onSkip() {
        editorState.showClassView = false;
        if (tool.needSave()) {
            onSave();
        }

        if (state.dataIndex < state.dataList.length - 1) {
            editor.emit(Event.IMAGE_CHANGE);
            state.showVerify = false;
            tool.loadData(state.dataIndex + 1);
        } else {
            message.info('This is last data ');
        }
    }

    async function onModify() {
        const { dataId, datasetId, dataConfig } = state.dataList[0];
        console.log(state.dataList[0]);
        try {
            const res = await api.takeRecordByData({
                datasetId: datasetId,
                dataIds: [dataId],
                dataType: 'SINGLE_DATA',
            });
            console.log(res);

            const { origin, pathname } = window.location;
            window.location.href = `${origin}${pathname}?recordId=${res.data}`;
        } catch (error) {
            // DATASET_DATA_EXIST_ANNOTATE
            console.log(error);
            message.warning(`Fail to modify data because it is being annotated by others`);
        }
    }

    // Shortcut
    const toggleKeyboard = _.debounce(() => {
        editorState.showKeyboard = !editorState.showKeyboard;
    }, 150);

    // Bind the method to the editor for easy access to shortcut keys
    editor.handlePageUp = onPre;
    editor.handlePageDown = onNext;
    editor.handleToggleKeyboard = toggleKeyboard;
    editor.handleSaveObject = onSave;

    let blocking = computed(() => {
        return (
            state.saving ||
            editorState.status === StatusType.Loading ||
            editorState.status === StatusType.Create
        );
    });
    // console.log('useheader', editor);
    // console.log('so this==', this);
    // editor.hotkeyManager.registryHotkey('T', () => {
    //     toggleKeyboard();
    // });

    return {
        blocking,
        dataIndex,
        onIndexChange,
        onIndexBlur,
        onSave,
        onPre,
        onNext,
        onClose,
        toggleKeyboard,
        onMark,
        onSubmit,
        onSkip,
        onModify,
    };
}
