import { reactive, onMounted, onBeforeUnmount, watch, ref } from 'vue';
import { Event as EditorEvent, Const } from 'pc-editor';
import { IUserData } from 'pc-editor';
import * as THREE from 'three';
import * as _ from 'lodash';
// import ToolEvent from '../../config/event';
import { useInjectEditor } from '../../state';

const COLOR = new THREE.Color();

export interface IConfig {
    noModelTrack?: boolean;
}

export type ITrackAction =
    | 'Split'
    | 'Delete'
    | 'MergeTo'
    | 'MergeFrom'
    | 'PreSplit'
    | 'PreMergeTo'
    | 'PreMergeFrom'
    | 'Cancel'
    | '';
export interface ITrackObject {
    trackId: string;
    trackName: string;
    list: IUserData[];
}
export type IMsgOption = {
    target: {
        x: number;
        y: number;
    };
    data: {
        msg: { class: string; msg: string }[];
    };
    visible: boolean;
};

export interface IBottomState {
    tip: (option: IMsgOption) => void;
    _config: IConfig;
    colorMap: {};
    // play
    playSpeed: number;
    playStart: number;
    play: boolean;
    animation: number;
    trackSplitIndex: number;
    annotationStatus: boolean[];
    showAnnotation: boolean;

    trackTargetLine: ITrackObject;

    trackList: ITrackObject[];

    trackMergeCode: string;
    trackSplitClass: string;
    trackSplitTrackId: string;
    trackMergeErrFrame: number[]; // 合并冲突帧
    trackPinSelected: string; //

    trackMergeResult: ITrackObject;
    trackAction: ITrackAction; // 操作行为

    activeType: {
        classType: any;
        modelClass: any;
    };
    frameConfig: {
        curFrameIndex: number;
        interval: number;
        spanWidth: number;
        // showProcess: boolean;
    };
}
export default function useBottom() {
    const editor = useInjectEditor();
    const zoomContainer = ref<HTMLElement>();
    const iState = reactive<IBottomState>({
        tip: async (option: IMsgOption) => {},
        _config: {},
        colorMap: {},
        playSpeed: 1,
        playStart: 0,
        play: false,
        animation: 1,
        // trackFlag: true,
        trackList: [],
        annotationStatus: [],
        showAnnotation: false,
        // trackPinList: [],
        trackSplitIndex: -1,
        trackSplitClass: '',
        trackSplitTrackId: '',
        trackTargetLine: { trackId: '', trackName: '', list: [] },
        trackMergeResult: { trackId: '', trackName: '', list: [] },
        trackMergeCode: 'ok',
        // 合并冲突帧
        trackMergeErrFrame: [],
        // 操作行为
        trackAction: '',
        trackPinSelected: '',
        activeType: {
            classType: undefined as any,
            modelClass: undefined as any,
        },
        frameConfig: {
            curFrameIndex: editor.state.frameIndex + 1,
            interval: 5, // default 5
            spanWidth: 18,
            // showProcess: false,
        },
    });
    //@ts-ignore
    window.iSState = iState;
    watch(
        () => editor.state.classTypes,
        (classTypes) => {
            const colorMap = {};
            classTypes.forEach((item) => {
                colorMap[item.id] = item.color;
                colorMap[`false_${item.id}`] = `#${COLOR.set(item.color).getHexString()}aa`;
            });
            iState.colorMap = colorMap;
        },
        { immediate: true },
    );

    watch(
        () => editor.state.frameIndex,
        () => {
            iState.frameConfig.curFrameIndex = editor.state.frameIndex + 1;
        },
    );
    watch(
        () => editor.state.frames,
        () => {
            if (iState.trackTargetLine.list.length !== editor.state.frames.length) {
                iState.trackTargetLine = emptyTrackObject();
            }
        },
        {
            immediate: true,
        },
    );

    onMounted(() => {
        editor.addEventListener(EditorEvent.CURRENT_TRACK_CHANGE, onSelect);
        editor.playManager.addEventListener(EditorEvent.PLAY_STOP, onFrameStop);
        // editor.addEventListener(EditorEvent.PRE_MERGE_ACTION, onPreMergeEvent);
        // editor.addEventListener(EditorEvent.PRE_SPLIT_ACTION, onPreSplitEvent);
        // editor.addEventListener(EditorEvent.UPDATE_TIME_LINE, onUpdate);
        editor.addEventListener(EditorEvent.ANNOTATE_CHANGE, onUpdate);
        editor.addEventListener(EditorEvent.ANNOTATE_ADD, onUpdate);
        // editor.addEventListener(EditorEvent.ANNOTATE_CLEAR, onUpdate);
        editor.addEventListener(EditorEvent.ANNOTATE_TRANSFORM_CHANGE, onUpdate);
        // editor.addEventListener(EditorEvent.VALID_CHANGE, onUpdate);
        editor.cmdManager.addEventListener(EditorEvent.UNDO, onUpdate);
        editor.cmdManager.addEventListener(EditorEvent.REDO, onUpdate);
        // editor.addEventListener(EditorEvent.CLEAR_MERGE_SPLIT, onClear);
        if (zoomContainer.value) {
            const container = zoomContainer.value as HTMLElement;
            container.addEventListener('wheel', onMouseWheel);
        }
    });

    onBeforeUnmount(() => {
        editor.removeEventListener(EditorEvent.CURRENT_TRACK_CHANGE, onSelect);
        editor.playManager.removeEventListener(EditorEvent.PLAY_STOP, onFrameStop);
        editor.removeEventListener(EditorEvent.ANNOTATE_CHANGE, onUpdate);
        editor.removeEventListener(EditorEvent.ANNOTATE_TRANSFORM_CHANGE, onUpdate);
        // editor.removeEventListener(EditorEvent.PRE_MERGE_ACTION, onPreMergeEvent);
        // editor.removeEventListener(EditorEvent.PRE_SPLIT_ACTION, onPreSplitEvent);
        // editor.removeEventListener(EditorEvent.UPDATE_TIME_LINE, onUpdate);
        // editor.removeEventListener(EditorEvent.VALID_CHANGE, onUpdate);
        editor.removeEventListener(EditorEvent.ANNOTATE_CLEAR, onUpdate);
        editor.cmdManager.removeEventListener(EditorEvent.UNDO, onUpdate);
        editor.cmdManager.removeEventListener(EditorEvent.REDO, onUpdate);
        // editor.removeEventListener(EditorEvent.CLEAR_MERGE_SPLIT, onClear);
        if (zoomContainer.value) {
            const container = zoomContainer.value as HTMLElement;
            container.removeEventListener('wheel', onMouseWheel);
        }
    });

    // function updateAnnotationStatus() {
    //     const trackId = editor.currentTrack;
    //     const length = editor.state.frames.length;
    //     const annotations = editor.state.annotations;
    //     const annotationStatus = Array(length);
    //     let showAnnotation = false;

    //     if (trackId) {
    //         const objectMap: Record<string, any> = annotations.reduce((map, obj) => {
    //             const { data, type, dataId } = obj;
    //             if (type === 'object') {
    //                 map[data.uuid] = editor.getFrameIndex(dataId);
    //             }
    //             return map;
    //         }, {});
    //         const objects = editor.trackManager.getObjects(trackId);
    //         objects.forEach((item) => {
    //             if (item) {
    //                 if (objectMap.hasOwnProperty(item.uuid)) {
    //                     annotationStatus[objectMap[item.uuid]] = true;
    //                     showAnnotation = true;
    //                 }
    //             }
    //         });
    //     } else {
    //         annotations.forEach((item) => {
    //             annotationStatus[editor.getFrameIndex(item.dataId)] = true;
    //         });
    //         showAnnotation = annotations.length > 0;
    //     }
    //     iState.annotationStatus = annotationStatus;
    //     iState.showAnnotation = showAnnotation;
    // }

    function onFrameStop() {
        iState.play = false;
        editor.loadManager.loadFrame(editor.state.frameIndex, false, true);
    }

    // ------
    // 时间轴 缩放
    function onMouseWheel(event: WheelEvent) {
        // return;

        event.preventDefault();

        if (event.deltaY < 0) {
            if (++iState.frameConfig.spanWidth > 36) {
                iState.frameConfig.spanWidth = 36;
            }
        } else {
            if (--iState.frameConfig.spanWidth < 14) {
                iState.frameConfig.spanWidth = 14;
            }
        }

        iState.frameConfig.interval = iState.frameConfig.spanWidth < 18 ? 10 : 5;
    }

    function onPreMergeEvent(data: any) {
        const { trackId, action, trackName } = data.data;

        if (action === 'cancel') {
            onHandleTrackAction('Cancel');
            return;
        }

        if (!trackId || !action) {
            return;
        }
        Object.assign(iState.trackMergeResult, {
            trackId: trackId,
            trackName: trackName,
        });
        switch (action) {
            case 'merge-to':
                onHandleTrackAction('PreMergeTo');
                break;
            case 'merge-from':
                onHandleTrackAction('PreMergeFrom');
                break;
            default:
                break;
        }
    }

    function onPreSplitEvent(data: any) {
        const { classId, action, trackId } = data.data;
        if (action === 'cancel') {
            onHandleTrackAction('Cancel');
        } else if (action === 'split') {
            iState.trackSplitClass = classId;
            iState.trackSplitTrackId = trackId;
            onHandleTrackAction('PreSplit');
        }
    }

    // function setInvisibleFlag(frameIndex: number, invisible: boolean) {
    //     const trackId = iState.trackTargetLine.trackId;
    //     if (!trackId) return;
    //     editor.toggleInvisible(trackId, invisible);
    //     updateTrackLine();
    // }

    function onPreTrackAction(action: ITrackAction) {
        const trackTargetId = iState.trackTargetLine.trackId;
        const { frames, frameIndex } = editor.state;
        if (!trackTargetId) {
            onClear();

            editor.showMsg('warning', editor.lang('selectObject'));

            return;
        }

        switch (action) {
            case 'PreSplit':
                iState.trackSplitIndex = frameIndex;
                onPreSplitData();
                break;
            case 'PreMergeTo':
            case 'PreMergeFrom':
                if (!iState.trackMergeResult.trackId) {
                    onClear();
                    // tool.editor.showMsg('warning', 'Please chose track object trackId');
                } else {
                    onPreMergeData();
                }
                break;
            default:
                break;
        }
    }

    const onHandleTrackAction = _.debounce((action: ITrackAction) => {
        iState.trackAction = action;
        switch (action) {
            case 'Cancel':
                onClear();
                break;
            case 'PreSplit':
            case 'PreMergeFrom':
            case 'PreMergeTo':
                onPreTrackAction(action);
                break;
            case 'MergeTo':
            case 'MergeFrom':
                // onMerge();
                break;
            case 'Split':
                // onSplit();
                break;
            case 'Delete':
                onDelete();
                break;
            default:
            case '':
                break;
        }
    }, 100);
    function onDelete() {
        const trackTargetId = iState.trackTargetLine.trackId;
        if (!trackTargetId) {
            editor.showMsg('warning', editor.lang('warnNoObject'));
            return;
        }
        const { frames } = editor.state;
        editor
            .showConfirm({
                title: editor.lang('btnDelete'),
                subTitle: editor.lang('deleteTitle'),
                okText: editor.lang('btnDelete'),
                cancelText: editor.lang('btnCancelText'),
                okDanger: true,
            })
            .then(
                () => {
                    try {
                        editor.trackManager.deleteObjectByTrack(trackTargetId, frames);
                        editor.pc.selectObject(editor.pc.selection);
                        editor.showMsg('success', editor.lang('successDelete'));
                        onClear();
                    } catch (error) {
                        editor.showMsg('error', editor.lang('errorDelete'));
                    }
                },
                () => {},
            );
    }
    function updateMergeCodeMsg() {
        const trackIdMerge = iState.trackMergeResult.trackId;

        const trackId = iState.trackTargetLine.trackId;
        const { code, data } = editor.trackManager.canMerge(trackId, trackIdMerge);

        iState.trackMergeCode = code;

        if (code === 'object_repeat') {
            iState.trackMergeErrFrame = data || [];
        } else {
            iState.trackMergeErrFrame = [];
        }
    }
    // 合并预览
    function onPreMergeData() {
        const trackIdMerge = iState.trackMergeResult.trackId;
        const trackName = iState.trackMergeResult.trackName;
        const trackId = iState.trackTargetLine.trackId;

        if (!trackId || !trackIdMerge) return;

        updateMergeCodeMsg();

        const trackList: any[] = [];

        // const frameCount = tool.state.dataList.length;

        const mergeTargetTrackList: IUserData[] = getTrackLine(trackIdMerge);

        trackList.push({
            trackName: trackName,
            trackId: trackIdMerge,
            list: mergeTargetTrackList,
        });

        iState.trackList = trackList;
    }
    // 拆分预览
    function onPreSplitData() {
        const trackId = iState.trackTargetLine.trackId;
        const list = iState.trackTargetLine.list;
        const dataIndex = iState.trackSplitIndex;
        if (!trackId || dataIndex < 0) return;
        const frameCount = list.length;
        if (!iState.trackSplitTrackId) {
            iState.trackSplitTrackId = editor.createTrackId();
        }
        const trackIdNew = iState.trackSplitTrackId;
        const trackListMap: ITrackObject[] = [];
        const beforeList = Array(frameCount);
        const afterList = Array(frameCount);
        const classType = iState.trackSplitClass;
        list.forEach((item, index) => {
            if (!item) return;
            if (index < dataIndex) {
                beforeList[index] = item;
            } else {
                afterList[index] = { ...item, classType: classType };
            }
        });
        trackListMap.push({
            trackName: iState.trackTargetLine.trackName,
            trackId: trackId,
            list: beforeList,
        });

        trackListMap.push({
            trackName: '',
            trackId: trackIdNew,
            list: afterList,
        });

        iState.trackList = trackListMap;
    }
    // 合并
    // function onMerge() {
    //     const curTrackId = iState.trackTargetLine.trackId;
    //     const mergeTrackId = iState.trackMergeResult.trackId;
    //     const trackMergeCode = iState.trackMergeCode;
    //     if (trackMergeCode !== 'ok') {
    //         let msg = 'error';
    //         switch (trackMergeCode) {
    //             case 'classType_diff':
    //                 msg = editor.lang('warnClassTypeDiff');
    //                 break;
    //             case 'object_repeat':
    //                 msg = editor.lang('warnObjectRepeat');
    //                 break;
    //             default:
    //                 break;
    //         }
    //         editor.showMsg('warning', msg);
    //         return;
    //     }
    //     try {
    //         switch (iState.trackAction) {
    //             case 'MergeFrom':
    //                 editor.trackManager.mergeTrackObject(mergeTrackId, curTrackId);
    //                 updateTrackLine(true);
    //                 break;

    //             case 'MergeTo':
    //                 editor.trackManager.mergeTrackObject(curTrackId, mergeTrackId);
    //                 editor.selectByTrackId(mergeTrackId);
    //                 // iState.trackTargetLine.trackId = mergeTrackId;

    //                 break;

    //             default:
    //                 break;
    //         }
    //         // editor.dispatchEvent({ type: EditorEvent.CLEAR_MERGE_SPLIT });
    //         editor.showMsg('success', editor.lang('successMerge'));
    //     } catch (error) {
    //         editor.showMsg('error', editor.lang('errorMerge'));
    //     }
    // }
    // 拆分
    // function onSplit() {
    //     const trackId = iState.trackTargetLine.trackId;
    //     const start = iState.trackSplitIndex;

    //     const canSplit = editor.trackManager.canSplit(trackId, start);

    //     if (!canSplit) {
    //         editor.showMsg('warning', editor.lang('warnEmptyObject'));
    //         return;
    //     }
    //     try {
    //         const splitTrackId = iState.trackList[1].trackId;
    //         const classConfig = editor.getClassType(iState.trackSplitClass);
    //         editor.trackManager.splitTrackObject({
    //             trackId: trackId,
    //             start: start,
    //             userData: {
    //                 trackId: splitTrackId,
    //                 classId: iState.trackSplitClass,
    //                 classType: classConfig.name,
    //             },
    //         });
    //         onClear();
    //         updateTrackLine();
    //         // editor.dispatchEvent({ type: EditorEvent.CLEAR_MERGE_SPLIT });
    //         editor.showMsg('success', editor.lang('successSplit'));
    //     } catch (error) {
    //         editor.showMsg('error', editor.lang('errorSplit'));
    //     }
    // }
    // 更新当前TrackLine
    function updateTrackLine(force: boolean = false) {
        const trackId = editor.currentTrack;
        if (trackId && trackId === iState.trackTargetLine.trackId && !force) return;
        if (trackId) {
            Object.assign(iState.trackTargetLine, {
                trackId: trackId,
                trackName: editor.trackManager.trackMap.get(trackId + '')?.trackName || '',
            });
            iState.trackTargetLine.list = getTrackLine(trackId);
        } else {
            iState.trackTargetLine = emptyTrackObject();
        }
    }

    function getTrackLine(trackId: string) {
        const length = editor.state.frames.length;
        if (!trackId) return Array(length);
        const list = editor.trackManager.getTrackObjectMap(trackId)[trackId];
        if (!list) return Array(length);
        return list.map((item: any) => {
            const invalid = item.some((el: any) => el.invalidConfig);
            const trueValue = item.every(
                (el: any) => el.userData.resultStatus === Const.True_Value,
            );
            return {
                ...item[0].userData,
                invalid: invalid,
                trueValue: trueValue,
            };
        });
    }

    // Object userData change Event
    const onUpdate = _.throttle((data: any) => {
        updateTrackLine(true);
        const trackIds = [
            ...iState.trackList.map((item) => item.trackId),
            iState.trackMergeResult.trackId,
        ];
        if (editor.currentTrack && trackIds.indexOf(editor.currentTrack) < 0) return;
        const { trackAction } = iState;
        switch (trackAction) {
            case 'PreMergeFrom':
            case 'PreMergeTo':
                updateMergeCodeMsg();
            // falls through
            case 'PreSplit':
                onPreTrackAction(trackAction);
                break;
        }
    }, 200);

    function emptyTrackObject(): ITrackObject {
        const length = editor.state.frames.length;
        return {
            trackId: '',
            trackName: '',
            list: Array(length),
        };
    }
    // object select event
    const onSelect = _.debounce(() => {
        onClear();
        updateTrackLine();
        // updateAnnotationStatus();
    }, 200);
    // 重置
    function onClear() {
        iState.trackAction = '';
        iState.trackMergeErrFrame = [];
        iState.trackMergeResult = emptyTrackObject();
        iState.trackList = [];
        iState.trackSplitClass = '';
        iState.trackSplitTrackId = '';
        // iState.trackMergeResultList = [];
        iState.trackSplitIndex = -1;
    }

    function setConfig(config?: IConfig) {
        Object.assign(iState._config, config || {});
    }
    return {
        editor,
        iState,
        setConfig,
        zoomContainer,
        updateTrackLine,
        onHandleTrackAction,
    };
}
