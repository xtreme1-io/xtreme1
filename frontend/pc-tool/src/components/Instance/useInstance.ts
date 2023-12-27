import { reactive, ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import * as _ from 'lodash';
import * as THREE from 'three';
// import { colord } from 'colord';
import { AnnotateObject, Event, MainRenderView, Object2D } from 'pc-render';
import {
    IUserData,
    Event as EditorEvent,
    IClassType,
    AttrType,
    StatusType,
    IFrame,
} from 'pc-editor';
import type { IClass, IState, IItem, IClassify } from './type';
import { AnnotateType, Rect } from 'pc-render';
import { useInjectEditor } from '../../state';
import * as locale from './lang';

import useItem from './useItem';
import useClassItem from './useClassItem';
import useTrackItem from './useTrackItem';

export const animation = {
    onEnter(node: any, done: any) {},
    onLeave(node: any, done: any) {
        done();
    },
};

const noClassifyKey = '__NO__Classify__' + Date.now();
const noClassKey = '__NO__Class__' + Date.now();

export default function useInstance() {
    let editor = useInjectEditor();
    const pc = editor.pc;
    const editorState = editor.state;
    let itemHandler = useItem();
    let trackHandler = useTrackItem();
    let classHandler = useClassItem();
    let domRef = ref<HTMLDivElement | null>(null);

    let attrObjectMap: Record<string, AnnotateObject> = {};

    let $$ = editor.bindLocale(locale);

    let updateListFlag = true;
    let updateAttrFlag = true;
    let updateSelectFlag = true;

    const state = reactive<IState>({
        // activeClass: [],
        // activeTrack: [],
        trackId: '',
        classType: '',
        selectMap: {},
        // selectId: '',
        list: [],
        objectN: 0,
        showAttr: false,
        globalClassifyMap: {},
        globalClassMap: {},
        globalTrackMap: {},
        expandAll: false,
    });

    // @ts-ignore
    window.testState = state;

    // *****life hook******
    onMounted(() => {
        editor.addEventListener(EditorEvent.RESULT_EXPAND_TOGGLE, onExpandToggle);
        editor.addEventListener(EditorEvent.ANNOTATE_SELECT, onSelect);
        editor.addEventListener(EditorEvent.ANNOTATE_REMOVE, onUpdateList);
        editor.addEventListener(EditorEvent.ANNOTATE_ADD, onUpdateList);
        editor.addEventListener(EditorEvent.ANNOTATE_CHANGE, onAnnotateChange);
        editor.addEventListener(EditorEvent.ANNOTATE_LOAD, onUpdateList);
        if (pc.getAnnotate3D().length > 0 || pc.getAnnotate2D().length > 0) {
            update();
        }
    });

    onBeforeUnmount(() => {
        editor.removeEventListener(EditorEvent.RESULT_EXPAND_TOGGLE, onExpandToggle);
        editor.removeEventListener(EditorEvent.ANNOTATE_SELECT, onSelect);
        editor.removeEventListener(EditorEvent.ANNOTATE_REMOVE, onUpdateList);
        editor.removeEventListener(EditorEvent.ANNOTATE_ADD, onUpdateList);
        editor.removeEventListener(EditorEvent.ANNOTATE_CHANGE, onAnnotateChange);
        editor.removeEventListener(EditorEvent.ANNOTATE_LOAD, onUpdateList);
    });

    // *****life hook******

    let scrollSelectToView = _.debounce(() => {
        // scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"})
        if (!domRef.value) return;
        let items = domRef.value.querySelectorAll(
            '.operation-instance .ant-collapse-item.ant-collapse-item-active .ant-collapse-content .list > .instance-track-item.active',
        );

        if (items.length > 0) {
            let dom = items[0];
            if (!isSelectVisible(dom as any, domRef.value)) {
                dom.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
            }
        }
    }, 100);

    function isSelectVisible(dom: HTMLDivElement, parent: HTMLDivElement) {
        let parentBox = parent.getBoundingClientRect();
        let domBox = dom.getBoundingClientRect();

        if (domBox.y + domBox.height > parentBox.y + parentBox.height || domBox.y < parentBox.y)
            return false;
        return true;
    }

    let classValueLabel = computed(() => {
        // class config
        let valueLabelMap: Record<string, string> = {};
        editorState.classTypes.forEach((config) => {
            config.attrs.forEach((attr) => {
                let valuePre = `${config.name}-${attr.name}`;
                let valueKey = '';
                if (attr.type === AttrType.TEXT) {
                    return;
                } else {
                    attr.options.forEach((item) => {
                        valueKey = `${valuePre}-${item.value}`;
                        valueLabelMap[valueKey] = item.label;
                    });
                }
            });
        });
        return valueLabelMap;
    });

    // window.classValueLabel = classValueLabel;

    let update = _.debounce((needUpdateSelect = true) => {
        if (editor.state.status === StatusType.Play) return;

        console.log('result list update');

        if (updateListFlag) {
            updateAttrFlag = true;
            updateSelectFlag = true;
            updateList();
        }

        if (updateSelectFlag && needUpdateSelect) {
            updateSelect();
        }

        // if (updateAttrFlag) {
        //     updateAttr();
        // }

        scrollSelectToView();

        // map info
    }, 100);

    function onUpdateList() {
        updateListFlag = true;
        update();
    }

    function onExpandToggle() {
        let { config } = editor.state;
        let expandAll = !state.expandAll;
        state.expandAll = expandAll;

        state.list.forEach((classifyInfo) => {
            classifyInfo.active = [classifyInfo.key];
            classifyInfo.activeClass = expandAll ? classifyInfo.data.map((e) => e.key) : [];
            classifyInfo.data.forEach((classInfo) => {
                classInfo.data.forEach((trackInfo) => {
                    trackInfo.active = expandAll ? [trackInfo.key] : [];
                });
            });
        });

        config.showAttr = expandAll;
        // if (config.showAttr) {
        //     updateListFlag = true;
        //     updateAttrFlag = true;
        //     update(false);
        // }
    }

    function onAnnotateChange(data: any) {
        let objects = data.data.objects as AnnotateObject[];
        let type = data.data.type as string;
        let datas = data.data.datas ?? {};
        let curFrame = editor.getCurrentFrame();
        const _data = Array.isArray(datas) ? datas[0] : datas;
        if (type === 'userData') {
            if ('trackId' in _data || 'classType' in _data) {
                updateListFlag = true;
            }
        }
        if (type === 'visible') {
            updateListFlag = true;
        }

        objects.forEach((e) => {
            let frame = (e as any).frame as IFrame;
            let trackId = e.userData.trackId;
            if (frame.id === curFrame.id && trackId) {
                attrObjectMap[trackId] = e;
                updateAttrFlag = true;
            }
        });

        update();
    }

    function updateList() {
        let object3Ds = pc.getAnnotate3D();
        let object2Ds = pc.getAnnotate2D();
        let objects = [...object3Ds, ...object2Ds];

        let classifyMap: Record<string, IClassify> = {};
        let trackMap: Record<string, IItem> = {};
        let classMap: Record<string, IClass> = {};

        let oldActive = getOldActive();

        let noProject = createClassify(noClassifyKey, $$('no-project'));
        // active
        noProject.active = oldActive[noClassifyKey] || [noClassifyKey];
        noProject.activeClass = oldActive[noClassifyKey + '-class'] || [];
        let noClassMapKey = noProject.key + noClassKey;
        let noClass: IClass = {
            key: noClassMapKey,
            classId: '',
            classType: '',
            className: $$('class-required'),
            data: [],
            visible: true,
            color: '',
            isModel: false,
        };
        noProject.data = [];
        state.list = [noProject];

        classMap[noClassMapKey] = noClass;
        classifyMap[noProject.key] = noProject;

        editor.state.classTypes.forEach((item) => {
            let classMapId = noClassifyKey + item.id + item.name;
            let insList: IClass = {
                key: classMapId,
                classId: item.id,
                classType: item.id,
                className: item.name,
                color: item.color,
                data: [],
                visible: false,
                isModel: false,
            };
            classifyMap[noClassifyKey].data.push(insList);
            classMap[classMapId] = insList;
        });

        objects.forEach((obj) => {
            let uuid = obj.uuid;
            let userData = obj.userData as Required<IUserData>;

            let trackId = userData.trackId;
            let trackName = userData.trackName;
            let { classify, classifyName } = getClassify(userData);
            let { className, classType, classId, isModel } = getClassInfo(userData);
            let classConfig = editor.getClassType(classId || classType);
            if (classConfig && classConfig.label) className = classConfig.label;

            // attr update
            if (!attrObjectMap[trackId]) attrObjectMap[trackId] = obj;

            // only one classify
            classify = noClassifyKey;
            let trackMapId = trackId;
            let classMapId = classify + classId + classType;

            let name = userData.id.slice(-4);

            let item: IItem = {
                id: uuid,
                key: '',
                isTrackItem: false,
                data: [],
                annotateType:
                    obj instanceof THREE.Object3D ? '3d' : obj instanceof Rect ? 'rect' : 'box2d',
                name: name,
                visible: obj.visible,
                isModel: !!userData.modelClass,
                active: [],
            };

            if (!classifyMap[classify]) {
                let classifyInfo = createClassify(classify, classifyName);
                // active
                classifyInfo.active = oldActive[classifyInfo.key] || [];
                classifyInfo.activeClass = oldActive[classifyInfo.key + '-class'] || [];
                classifyMap[classify] = classifyInfo;
                state.list.push(classifyInfo);
            }

            if (!classMap[classMapId]) {
                let color = classConfig ? classConfig.color : '#ffffff';
                let insList: IClass = {
                    key: classMapId,
                    classId: classId,
                    classType,
                    className: className,
                    color,
                    data: [],
                    visible: false,
                    isModel: isModel,
                };
                classifyMap[classify].data.push(insList);
                classMap[classMapId] = insList;
            }

            if (!trackMap[trackMapId]) {
                let trackItem: IItem = {
                    id: trackId,
                    key: trackMapId,
                    name: trackName,
                    isTrackItem: true,
                    annotateType: '',
                    visible: false,
                    isModel: isModel,
                    data: [],
                    attrLabel: '',
                    active: oldActive[trackMapId] || [],
                };

                classMap[classMapId].data.push(trackItem);
                trackMap[trackMapId] = trackItem;
            }

            trackMap[trackMapId].data.push(item);
        });

        if (noClass.data.length > 0) {
            noProject.data.unshift(noClass);
        }
        state.list.forEach((info) => {
            filterInfo(info);
        });

        state.globalTrackMap = trackMap;
        state.globalClassMap = classMap;
        state.globalClassifyMap = classifyMap;
        updateListFlag = false;
    }

    function updateAttr() {
        if (editorState.config.enableShowAttr && editorState.config.showAttr) {
            for (let trackId in attrObjectMap) {
                let object = attrObjectMap[trackId];

                let { classType, classId } = getClassInfo(object.userData);
                let classConfig = editor.getClassType(classId || classType);
                let trackItem = state.globalTrackMap[trackId];

                if (classConfig && trackItem) {
                    trackItem.attrLabel = getAttrLabel(object.userData.attrs, classConfig);
                }
            }
        }

        updateAttrFlag = false;
        attrObjectMap = {};
    }

    function updateSelect() {
        let selection = editor.pc.selection;
        if (selection.length === 0) {
            state.selectMap = {};
            state.trackId = '';
            return;
        }

        let userData = selection[0].userData;
        let trackId = userData.trackId || '';
        let { classify, classifyName } = getClassify(userData);
        let { className, classType, classId } = getClassInfo(userData);

        let selectMap = {};
        selection.forEach((e) => {
            selectMap[e.uuid] = true;
        });
        state.selectMap = selectMap;
        state.trackId = userData.trackId;
        editor.state.currentClass = userData.classId || '';
        let classMapId = classify + classId + classType;

        state.list.forEach((classifyInfo) => {
            if (classifyInfo.key !== classify) {
                classifyInfo.active = [];
                return;
            }
            classifyInfo.active = [classify];
            if (classifyInfo.activeClass.indexOf(classMapId) < 0)
                classifyInfo.activeClass = [...classifyInfo.activeClass, classMapId];
            classifyInfo.data.forEach((classInfo) => {
                classInfo.data.forEach((trackInfo) => {
                    if (trackInfo.key === trackId) {
                        trackInfo.active = [trackId];
                    }
                });
            });
        });

        updateSelectFlag = false;
    }

    function getOldActive() {
        let activeMap = {} as Record<string, string[]>;
        state.list.forEach((classify) => {
            activeMap[classify.key] = classify.active;
            activeMap[classify.key + '-class'] = classify.activeClass;
            classify.data.forEach((classInfo) => {
                classInfo.data.forEach((track) => {
                    activeMap[track.key] = track.active;
                });
            });
        });
        return activeMap;
    }

    function createClassify(key: string, name: string) {
        let data: IClassify = {
            key,
            name,
            data: [],
            objectN: 0,
            visible: false,
            active: [],
            activeClass: [],
        };
        return data;
    }

    function getAttrLabel(attrs: any = {}, classConfig: IClassType) {
        let index = 0;
        let str = '';
        let valueMap = classValueLabel.value;
        classConfig.attrs.forEach((e) => {
            let value = attrs[e.name];
            if (empty(value)) return;

            let valueKeyPre = `${classConfig.name}-${e.name}`;
            let valueKey = e.type === AttrType.TEXT ? valueKeyPre : `${valueKeyPre}-${value}`;

            let valueLabel = '';

            if (Array.isArray(value)) {
                let label;
                value.forEach((e, index) => {
                    valueKey = `${valueKeyPre}-${e}`;
                    label = valueMap[valueKey] || e;
                    valueLabel += index === 0 ? label : `,${label}`;
                });
            } else {
                valueKey = e.type === AttrType.TEXT ? valueKeyPre : `${valueKeyPre}-${value}`;
                valueLabel = valueMap[valueKey] || value;
            }

            value = Array.isArray(value) ? value.join(',') : value;
            str += index === 0 ? valueLabel : ` | ${valueLabel}`;
            index++;
        });
        return str;
    }

    function empty(value: any) {
        return (
            value === null ||
            value === undefined ||
            value === '' ||
            (Array.isArray(value) && value.length === 0)
        );
    }

    function filterInfo(classifyInfo: IClassify) {
        let objectN = 0;
        let classifyVisible = false;
        classifyInfo.data.forEach((classInfo) => {
            let classVisible = false;
            classInfo.data.forEach((trackInfo) => {
                let hasVisible = false;
                let haInvisible = false;
                trackInfo.data.forEach((e) => {
                    if (e.visible) {
                        hasVisible = true;
                        classifyVisible = true;
                        classVisible = true;
                    }
                    if (e.invisible) haInvisible = true;
                });
                trackInfo.visible = hasVisible;
                trackInfo.invisible = haInvisible;
                objectN++;
            });
            classInfo.visible = classVisible;
        });
        classifyInfo.visible = classifyVisible;
        classifyInfo.objectN = objectN;
        return objectN;
    }

    function getClassify(userData: IUserData) {
        let classify = userData.modelRun || noClassifyKey;
        let classifyName = classify ? userData.modelRunLabel || '' : '';

        return { classify, classifyName };
    }

    function getClassInfo(userData: IUserData) {
        let className = userData.classType || userData.modelClass || '';
        let classType = noClassKey;
        let isModel = false;
        if (userData.classType) {
            classType = userData.classType;
        } else if (userData.modelClass) {
            classType = '__Model__##' + userData.modelClass;
            isModel = true;
        }
        return { className, classType, isModel, classId: userData.classId ?? '' };
    }

    function onItemClick(item: IItem) {
        if (!item.visible) return;

        let objects = item.annotateType === '3d' ? pc.getAnnotate3D() : pc.getAnnotate2D();
        let find = _.find(objects, (box: THREE.Object3D) => {
            return box.uuid === item.id;
        }) as THREE.Object3D;

        if (find) {
            pc.selectObject(find as any);
        }
    }

    function onItemTool(action: string, item: IItem) {
        switch (action) {
            case 'itemClick':
                onItemClick(item);
                break;
            case 'toggleVisible':
                itemHandler.onToggleVisible(item);
                break;
            case 'annotation':
                itemHandler.onAnnotation(item);
                break;
            case 'edit':
                itemHandler.onEdit(item);
                break;
            case 'delete':
                itemHandler.onDelete(item);
                break;
        }
    }

    function onClassTool(
        action: 'toggleVisible' | 'edit' | 'delete' | 'clickHeader',
        item: IClass,
    ) {
        switch (action) {
            case 'toggleVisible':
                classHandler.onToggleVisible(item);
                break;
            case 'edit':
                classHandler.onEdit(item);
                break;
            case 'delete':
                classHandler.onDelete(item);
                break;
            case 'clickHeader':
                classHandler.onHeaderClick(item);
                break;
        }
    }

    function onTrackTool(action: 'toggleVisible' | 'delete' | 'edit' | 'select', item: IItem) {
        switch (action) {
            case 'toggleVisible':
                trackHandler.onToggleVisible(item);
                break;
            case 'delete':
                trackHandler.onDelete(item);
                break;
            case 'edit':
                trackHandler.onEdit(item);
                break;
            case 'select':
                trackHandler.onSelect(item);
                break;
        }
    }

    function onSelect() {
        if (editor.state.status === StatusType.Play) return;

        updateSelectFlag = true;
        update();
    }

    function onToggleAttr() {
        editor.state.config.showAttr = !editor.state.config.showAttr;
        if (editor.state.config.showAttr) {
            updateListFlag = true;
            updateAttrFlag = true;
            update();
        } else {
            scrollSelectToView();
        }
    }

    return {
        editor,
        noClassKey,
        state,
        domRef,
        // animation,
        onToggleAttr,
        onItemTool,
        onClassTool,
        onTrackTool,
        $$,
        // onEditModelClass,
    };
}
