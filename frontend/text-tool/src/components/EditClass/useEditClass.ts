import { reactive, onMounted, onBeforeUnmount, watch } from 'vue';
import { useClipboard } from '@vueuse/core';
import { AttrType, IClassType, Event, utils, IUserData, Const } from 'pc-editor';
import { AnnotateObject, Box, Rect } from 'pc-render';
import { useInjectState } from '../../state';
import { IState, IInstanceItem, MsgType, IControl } from './type';
import { useInjectEditor } from '../../state';
import * as _ from 'lodash';
import * as THREE from 'three';
import * as locale from './lang';
import useControl from './useControl';

let SOURCE_CLASS = 'edit_class';
// type IEmit = (event: 'close', ...args: any[]) => void;

export default function useEditClass() {
    const { copy } = useClipboard();
    let editor = useInjectEditor();
    let editorState = useInjectState();
    let control = useControl();
    // object
    let trackAttrs = {} as Record<string, any>;
    let trackObject = {} as AnnotateObject;
    let tempObjects = [] as AnnotateObject[];
    // lang
    let $$ = editor.bindLocale(locale);

    let state = reactive<IState>({
        activeTab: ['attribute', 'objects', 'cuboid'],
        showType: 'select',
        // batch
        batchVisible: true,
        isBatch: false,
        batchTrackIds: [],
        instances: [],
        filterInstances: [],
        modelClass: '',
        confidenceRange: [0.2, 1],
        //
        objectId: '',
        trackId: '',
        trackName: '',
        trackVisible: false,
        isStandard: false,
        resultStatus: '',
        resultType: '',
        resultInstances: [],
        annotateType: '',
        classType: '',
        isClassStandard: false,
        isInvisible: false,
        attrs: [],
        // msg
        showMsgType: '',
        //
    });
    watch(
        () => [state.confidenceRange, state.instances],
        () => {
            let [min, max] = state.confidenceRange;
            let filterInstances = state.instances.filter((e) => {
                let confidence = e.confidence || 0;
                return confidence >= min && confidence <= max;
            });
            let objectMap = {} as Record<string, AnnotateObject>;
            tempObjects.forEach((e) => {
                objectMap[e.uuid] = e;
            });
            let noVisible = filterInstances.filter((e) => !objectMap[e.id].visible);
            state.filterInstances = filterInstances;
            state.batchVisible = noVisible.length === 0;
        },
    );

    let update = _.debounce(() => {
        if (!control.needUpdate()) return;
        clear();
        console.log('class edit update');
        if (state.isBatch) {
            showBatchObject(state.batchTrackIds);
        } else {
            showObject(state.trackId);
        }
    }, 100);

    onMounted(() => {
        editor.addEventListener(Event.SHOW_CLASS_INFO, (data: any) => {
            let trackIds = data.data.id;
            state.showType = 'msg';
            handleObject(trackIds);
        });
        editor.addEventListener(Event.ANNOTATE_SELECT, onSelect);
        editor.addEventListener(Event.ANNOTATE_REMOVE, syncUpdate);
        editor.addEventListener(Event.ANNOTATE_ADD, syncUpdate);
        editor.addEventListener(Event.ANNOTATE_CHANGE, syncUpdate);
    });

    onBeforeUnmount(() => {
        editor.removeEventListener(Event.ANNOTATE_SELECT, onSelect);
        editor.removeEventListener(Event.ANNOTATE_REMOVE, syncUpdate);
        editor.removeEventListener(Event.ANNOTATE_ADD, syncUpdate);
        editor.removeEventListener(Event.ANNOTATE_CHANGE, syncUpdate);
    });

    function onClearMergeSplit() {
        if (
            state.showMsgType === 'split' ||
            state.showMsgType === 'merge-from' ||
            state.showMsgType === 'merge-to'
        ) {
            state.showMsgType = '';
        }
    }

    function onSelect(data: any) {
        let selection = data.data.curSelection as AnnotateObject[];
        if (selection.length > 0) {
            state.showType = 'select';
            handleObject(selection[0].userData.trackId);
        } else {
            if (state.showType === 'select') close();
        }
    }

    function syncUpdate() {
        if (editor.eventSource === SOURCE_CLASS) return;
        update();
    }

    function handleObject(trackId: string | string[]) {
        if (Array.isArray(trackId)) {
            state.batchTrackIds = trackId;
            state.isBatch = true;
        } else {
            state.trackId = trackId;
            state.isBatch = false;
        }
        update();
    }

    function clear() {
        state.batchVisible = true;
        state.classType = '';
        state.isClassStandard = false;
        state.isStandard = false;
        state.isInvisible = false;
        state.resultType = '';
        state.resultStatus = '';
        state.resultInstances = [];
        state.objectId = '';
        state.trackName = '';
        state.trackVisible = false;
        state.annotateType = '';

        state.modelClass = '';
        state.instances = [];
        state.attrs = [];
        state.showMsgType = '';

        // state.trackId = '';
        // state.isBatch = false;
    }

    function close() {
        // emit('close');
        control.close();
    }

    function showBatchObject(trackIds: string[]) {
        let trackIdMap = {};
        trackIds.forEach((id) => (trackIdMap[id] = true));
        let objects = editor.pc
            .getAnnotate3D()
            .filter((e) => trackIdMap[e.userData.trackId]) as AnnotateObject[];

        if (objects.length === 0) {
            close();
            return;
        }

        let object = objects[0];
        state.objectId = new Date().getTime() + '';
        state.modelClass = (object.userData as IUserData).modelClass || '';
        state.classType = object.userData.classId || object.userData.classType || '';

        let confidenceMax = 0;
        let confidenceMin = 1;
        let instances: IInstanceItem[] = objects.map((e) => {
            let name = e.userData.trackName || '';
            let confidence = e.userData.confidence || 1;
            if (confidence > confidenceMax) confidenceMax = confidence;
            if (confidence < confidenceMin) confidenceMin = confidence;
            return { id: e.uuid, name: name, confidence: confidence };
        });

        let confidenceMinFix = +confidenceMin.toFixed(2);
        confidenceMinFix = Math.max(confidenceMinFix - 0.01, 0);
        let confidenceMaxFix = +confidenceMax.toFixed(2);
        confidenceMaxFix = Math.min(confidenceMaxFix + 0.01, 1);

        state.instances = instances;
        state.confidenceRange = [confidenceMinFix, confidenceMaxFix];

        tempObjects = objects;
    }

    function showObject(trackId: string) {
        let annotate2d = editor.pc.getAnnotate2D();
        let annotate3d = editor.pc.getAnnotate3D();

        let info = getAnnotateByTrackId([...annotate3d, ...annotate2d], trackId);

        if (info.annotate3D.length === 0 && info.annotate2D.length === 0) {
            close();
            return;
        }

        let object = info.annotate3D.length > 0 ? info.annotate3D[0] : info.annotate2D[0];
        let userData = editor.getObjectUserData(object);

        state.objectId = object.uuid;
        state.modelClass = userData.modelClass || '';
        state.classType = userData.classId || userData.classType || '';
        // state.isInvisible = !!userData.invisibleFlag;
        state.trackId = userData.trackId || '';
        state.trackName = userData.trackName || '';
        // state.isStandard = userData.isStandard || false;
        // state.resultStatus = userData.resultStatus || Const.True_Value;
        // state.resultType = userData.resultType || Const.Dynamic;

        // temp
        trackObject = object;
        tempObjects = [...info.annotate3D, ...info.annotate2D];

        let trackVisible = false;
        let rectTitle = $$('rect-title');
        let boxTitle = $$('box-title');
        state.resultInstances = tempObjects.map((e) => {
            let userData = e.userData as Required<IUserData>;
            let is3D = e instanceof Box;
            let info = $$('cloud-object');
            if (!is3D) {
                let isRect = e instanceof Rect;
                let index = get2DIndex((e as Rect).viewId);
                info = $$('image-object', {
                    index: index + 1,
                    type: isRect ? rectTitle : boxTitle,
                });
                // info = `Image ${index + 1} Object(${isRect ? 'Rect' : 'Box'})`;
            }

            if (e.visible) trackVisible = true;

            return { id: e.uuid, name: userData.id.slice(-4), info, confidence: 0 };
        });

        state.trackVisible = trackVisible;
        // state.annotateType = object.annotateType;
        if (state.classType) {
            updateAttrInfo(userData, state.classType);
            updateClassInfo();
        }
    }

    function updateAttrInfo(userData: IUserData, classType: string) {
        let classConfig = editor.getClassType(classType);
        if (!classConfig) return;
        let attrs = userData.attrs || {};
        // let newAttrs = classConfig.attrs.map((e) => {
        //     let defaultValue = e.type === AttrType.MULTI_SELECTION ? [] : '';
        //     // The array type may be a single value
        //     if (e.type === AttrType.MULTI_SELECTION && attrs[e.id] && !Array.isArray(attrs[e.id])) {
        //         attrs[e.id] = [attrs[e.id]];
        //     }
        //     let value = e.id in attrs ? attrs[e.id] : defaultValue;
        //     return { ...e, value };
        // });
        // state.attrs = newAttrs;
        state.attrs = utils.copyClassAttrs(classConfig, attrs);
        trackAttrs = JSON.parse(JSON.stringify(attrs));
    }

    function onInstanceRemove(item: IInstanceItem) {
        state.instances = state.instances.filter((e) => e.id !== item.id);
        tempObjects = tempObjects.filter((e) => e.uuid !== item.id);
    }

    function onToggleObjectsVisible() {
        let visible = !state.batchVisible;
        state.batchVisible = visible;

        let objects = getFilterObjects();
        if (objects.length > 0) {
            // pc.setVisible(objects, visible);
            editor.cmdManager.execute('toggle-visible', { objects: objects, visible });
        }
    }

    function getFilterObjects() {
        let insMap = {};
        state.filterInstances.forEach((e) => (insMap[e.id] = true));
        let objects = tempObjects.filter((e) => insMap[e.uuid]);
        return objects;
    }

    function onRemoveObjects() {
        if (tempObjects.length === 0) return;
        editor
            .showConfirm({ title: $$('msg-delete-title'), subTitle: $$('msg-delete-subtitle') })
            .then(
                () => {
                    let objects = getFilterObjects();
                    editor.cmdManager.execute('delete-object', [{ objects: objects }]);

                    let [min, max] = state.confidenceRange;
                    state.instances = state.instances.filter(
                        (e) => !(e.confidence >= min && e.confidence <= max),
                    );
                    if (state.instances.length === 0) close();
                },
                () => {},
            );
    }

    function updateClassInfo() {
        let classConfig = editor.getClassType(state.classType);
        if (!classConfig) return;

        state.isClassStandard = classConfig.type === 'standard';
    }

    function onClassChange() {
        if (state.isBatch) {
            updateClassMulti();
            return;
        }

        updateClassInfo();

        // let classConfig = editor.getClassType(state.classType);
        // let size3D = undefined;
        let classConfig = editor.getClassType(state.classType);
        let userData = {
            classType: classConfig?.name,
            classId: classConfig?.id,
            attrs: {},
            resultStatus: Const.True_Value,
        } as IUserData;

        editor.cmdManager.execute('update-object-user-data', {
            objects: tempObjects,

            data: userData,
        });

        state.resultStatus = Const.True_Value;
        updateAttrInfo(trackObject.userData, state.classType);
    }

    function updateClassMulti() {
        let { frameIndex, frames } = editor.state;

        let objects = getFilterObjects();
        let trackIdMap = {};
        objects.forEach((e) => (trackIdMap[e.userData.trackId] = true));
        let ids = Object.keys(trackIdMap);
        if (ids.length === 0) return;

        // let userData = {} as IUserData;
        // userData.classType = state.classType;
        // userData.attrs = {};
        // userData.resultStatus = Const.True_Value;
        let classConfig = editor.getClassType(state.classType);
        editor.cmdManager.execute('update-object-user-data', {
            objects: tempObjects,

            data: {
                classType: classConfig?.name,
                classId: classConfig?.id,
            },
        });
    }

    // attr
    let updateTrackAttr = _.debounce(() => {
        editor.withEventSource(SOURCE_CLASS, () => {
            let attrs = JSON.parse(JSON.stringify(trackAttrs));
            editor.cmdManager.execute('update-object-user-data', {
                objects: tempObjects,
                data: { attrs },
            });
        });
    }, 100);

    function onAttChange(name: string, value: any) {
        trackAttrs[name] = value;
        updateTrackAttr();
        state.resultStatus = Const.True_Value;
    }

    function onObjectInstanceRemove(item: IInstanceItem) {
        state.showType = 'msg';
        let annotate = tempObjects.find((e) => e.uuid === item.id);
        tempObjects = tempObjects.filter((e) => e.uuid !== item.id);
        if (annotate) {
            editor.cmdManager.withGroup(() => {
                if (tempObjects.length > 0) {
                    editor.cmdManager.execute('select-object', tempObjects);
                }
                editor.cmdManager.execute('delete-object', annotate);
            });
        }

        if (tempObjects.length === 0) {
            close();
        }
    }

    function copyAttrFrom(trackId: string) {
        // console.log(trackId);
        let box = editor.pc.getAnnotate3D().find((e) => e.userData.trackId === trackId) as Box;
        if (box) {
            let attrs = JSON.parse(JSON.stringify(box.userData.attrs));
            editor.cmdManager.execute('update-object-user-data', {
                objects: tempObjects,
                data: { attrs: attrs },
            });
            trackObject.userData.attrs = attrs;
            updateAttrInfo(trackObject.userData, state.classType);
            editor.showMsg('success', $$('msg-copy-success'));
        } else {
            editor.showMsg('error', $$('msg-no-object'));
        }
    }

    function onToggleTrackVisible() {
        let visible = !state.trackVisible;
        state.trackVisible = visible;

        let objects = tempObjects;
        state.showType = 'msg';
        editor.cmdManager.execute('toggle-visible', { objects, visible });
    }

    function onCopy() {
        copy(state.trackId);
        editor.showMsg('success', $$('copy-success'));
    }

    return {
        state,
        update,
        control,
        onAttChange,
        onClassChange,
        onInstanceRemove,
        onToggleObjectsVisible,
        onRemoveObjects,
        // onObjectStatusChange,
        onObjectInstanceRemove,
        copyAttrFrom,
        // copyAttrTo,
        onToggleTrackVisible,
        // toggleStandard,
    };
}

function getAnnotateByTrackId(annotates: AnnotateObject[], trackId: string) {
    let annotate3D = [] as AnnotateObject[];
    let annotate2D = [] as AnnotateObject[];
    annotates.forEach((obj) => {
        let userData = obj.userData as Required<IUserData>;
        if (userData.trackId !== trackId) return;

        if (obj instanceof Box) {
            annotate3D.push(obj);
        } else {
            annotate2D.push(obj);
        }
    });

    return { annotate2D, annotate3D };
}

function get2DIndex(viewId: string) {
    return parseInt((viewId.match(/[0-9]{1,5}$/) as any)[0]);
}

function getControl() {}
