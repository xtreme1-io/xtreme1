import { reactive, ref, createVNode, onMounted, onBeforeUnmount, nextTick } from 'vue';
import * as _ from 'lodash';
import {
    IUserData,
    Event,
    ToolType2AnnotatteType,
    AnnotateType2ToolType,
    AnnotateType,
} from 'editor';
import type { IInstanceList, IInstanceState, IItem, IItemAttrs } from './type';
import { useInjectEditor, useInjectEditorState } from '../../../../../editor/inject';
import useItem from './useItem';
import { FilterEnum } from './type';

export default function useInstance() {
    let editor = useInjectEditor();
    const noClassKey = 'notClassed';
    const editorState = useInjectEditorState();
    let { onAnnotation, onDelete, onEdit, onToggleVisible } = useItem();
    const state = reactive<IInstanceState>({
        activeKey: [],
        select: [],
        list: [],
        objectN: 0,
        noClassList: {
            classType: '',
            data: [],
            visible: true,
            color: '',
            isModel: false,
            annotateType: '',
            filterVisible: true,
        },
    });
    const allFilter = ref<FilterEnum[]>([FilterEnum.class, FilterEnum.predictedClass]);
    const filterValue = ref<FilterEnum[]>([FilterEnum.class, FilterEnum.predictedClass]);
    const lastNoClassList = ref<any[]>([]);
    const lastHasClassList = ref<any[]>([]);
    const allVisible = ref<boolean>();

    // *****life hook******
    onMounted(() => {
        editor.on(Event.SELECT, onSelect);
        editor.on(Event.CLEAR_DATA, onClear);
        editor.on(Event.REMOVE_OBJECT, update);
        editor.on(Event.ADD_OBJECT, update);
        editor.on(Event.DIMENSION_CHANGE, update);
        editor.on(Event.VISIBLE_CHANGE, update);
        editor.on(Event.USER_DATA_CHANGE, onUserDataChange);
        editor.on(Event.LOAD_OBJECTS, update);
        editor.on(Event.FILTER_CHANGE, onToggleFilterVisible);
        editor.on(Event.FILTER_TOGGLE, toggleVisibleByFilter);
        editor.on(Event.IMAGE_CHANGE, changeImage);
        editor.on(Event.RESET_SELECT, resetStateSelect);
    });

    onBeforeUnmount(() => {
        editor.off(Event.SELECT, onSelect);
        editor.off(Event.CLEAR_DATA, onClear);
        editor.off(Event.REMOVE_OBJECT, update);
        editor.off(Event.ADD_OBJECT, update);
        editor.off(Event.DIMENSION_CHANGE, update);
        editor.off(Event.VISIBLE_CHANGE, update);
        editor.off(Event.USER_DATA_CHANGE, onUserDataChange);
        editor.off(Event.LOAD_OBJECTS, update);
        editor.off(Event.FILTER_CHANGE, onToggleFilterVisible);
        editor.off(Event.FILTER_TOGGLE, toggleVisibleByFilter);
        editor.off(Event.IMAGE_CHANGE, changeImage);
        editor.off(Event.RESET_SELECT, resetStateSelect);
    });

    // *****life hook******

    let update = _.debounce(() => {
        let objects = editor.tool?.toJSON() || [];

        state.objectN = objects.length;
        editorState.allVisible =
            objects.length > 0 ? !objects.every((item: any) => !item.visible) : true;

        let classConfigMap: Record<string, any> = {};
        editorState.classTypes.forEach((e) => {
            classConfigMap[e.name] = e;
        });
        // console.log('state.list ==>', state.list);

        // TODO classType 作为Map有bug, classType可能会重复
        let existMap: Record<string, Record<string, IItem>> = {};
        let classMap: Record<string, IItem[]> = {};
        state.list.forEach((info) => {
            existMap[info.classType] = existMap[info.classType] || {};
            classMap[info.classType] = info.data;
            info.data.forEach((data) => {
                existMap[info.classType][data.id] = data;
            });
        });

        existMap[''] = existMap[''] || {};
        classMap[''] = state.noClassList.data;
        state.noClassList.data.forEach((data) => {
            existMap[''][data.id] = data;
        });
        // console.log(existMap, classMap);

        let objectMap: Record<string, Record<string, IItem>> = {};
        objects.forEach((obj: any) => {
            let uuid = obj.uuid;
            let classType = obj.userData.classType || obj.userData.modelClass || '';
            if (!allFilter.value.includes(classType)) {
                allFilter.value.push(classType);
                filterValue.value.push(classType);
            }
            const filterClassType = classType == '' ? FilterEnum.noClass : classType;

            objectMap[classType] = objectMap[classType] || {};

            let name = obj.intId;
            if (existMap[classType] && existMap[classType][uuid]) {
                // console.log(obj);
                let item = existMap[classType][uuid];
                item.visible = obj.visible;
                item.name = '#' + name;
                item.attrs = Object.values(obj.userData.attrs || {}) as IItemAttrs;
                item.width = obj.width;
                item.height = obj.height;
                item.area = obj.area;
                item.lineLength = obj.lineLength;
                item.type = obj.type;

                item.filterVisible =
                    filterValue.value.includes(FilterEnum.class) ||
                    filterValue.value.includes(filterClassType);

                if (obj.userData?.modelClass) {
                    item.isModel = true;
                    item.filterVisible =
                        filterValue.value.includes(FilterEnum.predictedClass) ||
                        filterValue.value.includes(filterClassType);
                }

                objectMap[classType][uuid] = item;
            } else {
                let item: IItem = {
                    id: uuid,
                    annotateType: obj.type,
                    name: '#' + name,
                    visible: obj.visible,
                    isModel: false,
                    attrs: Object.values(obj.userData.attrs || {}) as IItemAttrs,
                    type: obj.type,
                    filterVisible: true,
                };
                item.width = obj.width;
                item.height = obj.height;
                item.area = obj.area;
                item.lineLength = obj.lineLength;

                item.filterVisible =
                    filterValue.value.includes(FilterEnum.class) ||
                    filterValue.value.includes(filterClassType);

                if (obj.userData?.modelClass) {
                    item.isModel = true;
                    item.filterVisible =
                        filterValue.value.includes(FilterEnum.predictedClass) ||
                        filterValue.value.includes(filterClassType);
                }

                if (!classMap[classType]) {
                    let { color, toolType } = getColor(obj);
                    // let color = classConfigMap[classType]
                    //     ? classConfigMap[classType].color
                    //     : obj.color || '#ffffff';
                    // let bgColor = colord(color).alpha(0.3).toRgbString();
                    let insList: IInstanceList = {
                        classType,
                        color,
                        // annotateType: ToolType2AnnotatteType[classConfigMap[classType]?.toolType],
                        annotateType: ToolType2AnnotatteType[toolType],
                        // bgColor,
                        data: [],
                        visible: true,
                        isModel: item.isModel,
                        filterVisible: true,
                    };

                    insList.filterVisible =
                        filterValue.value.includes(FilterEnum.class) ||
                        filterValue.value.includes(filterClassType);
                    if (item.isModel) {
                        insList.isModel = true;
                        insList.filterVisible =
                            filterValue.value.includes(FilterEnum.predictedClass) ||
                            filterValue.value.includes(filterClassType);
                    }
                    state.list.push(insList);

                    classMap[classType] = insList.data;
                }

                classMap[classType].push(item);

                existMap[classType] = existMap[classType] || {};
                existMap[classType][uuid] = item;
                objectMap[classType][uuid] = item;
            }
        });

        filterInfo(state.noClassList, objectMap);
        // console.log('state', state);
        state.list = state.list.filter((info) => {
            filterInfo(info, objectMap);
            return info.data.length;
        });
        selectedScrollToView();

        toggleVisibleByFilter();
    }, 100);

    function selectedScrollToView() {
        nextTick(() => {
            let selected = document.querySelector('.operation-instance .item.active');
            if (selected) {
                selected.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }
        });
    }
    function filterInfo(info: IInstanceList, objectMap: Record<string, Record<string, IItem>>) {
        let data: IItem[] = [];
        let hasNoVisible = false;
        let hasNoModel = false;
        info.data.forEach((e) => {
            if (objectMap[info.classType] && objectMap[info.classType][e.id]) {
                data.push(e);
                if (!e.isModel) hasNoModel = true;
            }
        });
        info.data = data;
        info.visible = !data.every((item) => !item.visible);
        info.isModel = !hasNoModel;
    }

    function onDeleteClassObject(item: IInstanceList) {
        editor.showConfirm({ title: 'Delete', subTitle: 'Delete Objects?' }).then(
            () => {
                let idMap = [] as string[];
                item.data.forEach((e) => {
                    idMap.push(e.id);
                });
                editor.cmdManager.execute('delete-object', {
                    object: editor.tool
                        ?.toJSON()
                        .filter((record: any) => idMap.includes(record.uuid)),
                    id: idMap,
                });
                if (idMap.length > 0) {
                    editor.tool?.removeById(idMap);
                }

                const filterClassType = item.classType == '' ? FilterEnum.noClass : item.classType;
                const index = allFilter.value.findIndex((filter) => filter == filterClassType);
                allFilter.value.splice(index, 1);
                filterValue.value.splice(index, 1);
            },
            () => {},
        );
    }

    function onEditModelClass(item: IInstanceList) {
        let idMap = {};
        item.data.forEach((e) => {
            idMap[e.id] = true;
        });
    }

    function onToggleClassVisible(item: IInstanceList) {
        let visible = item.filterVisible && !item.visible;
        item.visible = visible;

        let idMap = [] as string[];
        item.data.forEach((e) => {
            idMap.push(e.id);
        });
        if (idMap.length > 0) {
            editor.setVisible(idMap, visible);
        }
    }

    function onItemClick(item: IItem, e: MouseEvent) {
        editor.tool?.selectShapeById(item.id, e ? e.shiftKey : false);
    }

    function onItemTool(action: string, item: IItem, e: MouseEvent) {
        switch (action) {
            case 'itemClick':
                onItemClick(item, e);
                break;
            case 'toggleVisible':
                onToggleVisible(item);
                break;
            case 'annotation':
                onAnnotation(item);
                break;
            case 'edit':
                onEdit(item);
                break;
            case 'delete':
                onDelete(item);
                break;
        }
    }

    function onClear() {
        state.objectN = 0;
        state.list = [];
        state.noClassList.data = [];
        editorState.allVisible = true;
    }

    function onSelect(data: any) {
        let selection = data.data.curSelection;
        if (selection.length > 0) {
            let classType = selection.map((item) => {
                return item.userData.classType || item.userData.modelClass || noClassKey;
            });
            state.select = selection.map((t: any) => t.uuid);
            state.activeKey = [...new Set(classType)];
        } else {
            state.select = [];
        }
        selectedScrollToView();
    }

    function onUserDataChange(data: any) {
        let options = data.data.options;
        let option = Array.isArray(options) ? options[0] : options;
        if ('classType' in option.userData || 'modelClass' in option.userData) {
            if (option.userData.classType || option.userData.modelClass)
                state.activeKey = [option.userData.classType || option.userData.modelClass];
        }
        update();
    }

    function onToggleFilterVisible(selectedKeys: FilterEnum[]) {
        console.log('filter --- ', selectedKeys);
        filterValue.value = selectedKeys;

        state.noClassList.filterVisible =
            filterValue.value.includes(FilterEnum.class) ||
            filterValue.value.includes(FilterEnum.noClass);
        state.noClassList.visible = state.noClassList.filterVisible;

        state.noClassList.data.forEach((shape: any) => {
            shape.filterVisible = state.noClassList.filterVisible;
            shape.visible = shape.filterVisible;
        });

        state.list.forEach((item: any) => {
            if (item.isModel) {
                if (
                    filterValue.value.includes(FilterEnum.predictedClass) ||
                    filterValue.value.includes(item.classType)
                ) {
                    item.filterVisible = true;
                    item.visible = true;
                    item.data.forEach((shape: any) => {
                        shape.filterVisible = true;
                        shape.visible = true;
                    });
                } else {
                    item.filterVisible = false;
                    item.visible = false;
                    item.data.forEach((shape: any) => {
                        shape.filterVisible = false;
                        shape.visible = false;
                    });
                }
            } else {
                if (
                    filterValue.value.includes(FilterEnum.class) ||
                    filterValue.value.includes(item.classType)
                ) {
                    item.filterVisible = true;
                    item.visible = true;
                    item.data.forEach((shape: any) => {
                        shape.filterVisible = true;
                        shape.visible = true;
                    });
                } else {
                    item.filterVisible = false;
                    item.visible = false;
                    item.data.forEach((shape: any) => {
                        shape.filterVisible = false;
                        shape.visible = false;
                    });
                }
            }
        });
    }

    function toggleVisibleByFilter(isAllVisible?: boolean) {
        console.log('toggleVisibleByFilter');
        const currentNoClassIds: string[] = [];
        state.noClassList.data.forEach((item: any) => {
            if (!_.isUndefined(isAllVisible)) item.visible = isAllVisible;
            if (item.filterVisible && item.visible) currentNoClassIds.push(item.id);
        });

        const currentHasClassIds: string[] = [];
        state.list.forEach((item: any) => {
            item.data.forEach((child: any) => {
                if (!_.isUndefined(isAllVisible)) child.visible = isAllVisible;
                if (child.filterVisible && child.visible) currentHasClassIds.push(child.id);
            });
        });
        if (
            _.isEqual(lastNoClassList.value, state.noClassList.data) &&
            _.isEqual(lastHasClassList.value, state.list)
        ) {
            if (_.isUndefined(isAllVisible)) {
                return;
            } else if (_.isEqual(allVisible.value, isAllVisible)) {
                return;
            }
        }

        console.log(2);
        lastNoClassList.value = _.cloneDeep(state.noClassList.data);
        lastHasClassList.value = _.cloneDeep(state.list);
        allVisible.value = editorState.allVisible;

        editor.setVisible([], false);
        if (currentNoClassIds.length > 0 || currentHasClassIds.length > 0) {
            editor.setVisible([...currentNoClassIds, ...currentHasClassIds], isAllVisible ?? true);
        }

        if (state.select.length > 0) {
            console.log('select', state);
            const selectId = state.select[0];
            const flag1 = state.noClassList.data.some((item) => {
                if (item.id == selectId) {
                    editor.setVisible([selectId], item.visible);
                    return true;
                } else {
                    return false;
                }
            });
            if (flag1) return;

            let flag2 = false;
            state.list.forEach((item) => {
                if (!flag2) {
                    item.data.forEach((child) => {
                        if (!flag2 && child.id == selectId) {
                            flag2 = true;
                            editor.setVisible([selectId], child.visible);
                        }
                    });
                }
            });
        }
    }

    function changeImage() {
        const defaultFilter = [FilterEnum.class, FilterEnum.predictedClass];
        onToggleFilterVisible(defaultFilter);
    }

    function resetStateSelect() {
        const selectId = state.select[0];
        console.log('reset state select', state.select);
        const flag1 = state.noClassList.data.some((item) => item.id == selectId);
        if (flag1) {
            editor.setVisible([selectId], state.noClassList.filterVisible);
            return;
        }
        let flag2 = false;
        state.list.forEach((item) => {
            if (!flag2) {
                item.data.forEach((child) => {
                    if (!flag2 && child.id == selectId) {
                        flag2 = true;
                        editor.setVisible([selectId], child.visible);
                    }
                });
            }
        });
    }

    // 根据 obj.classType 和 obj.toolType 获取颜色。，防止 name 重复
    function getColor(obj: any) {
        const classIdMap: Record<string, any> = {};
        editorState.classTypes.forEach((e) => {
            classIdMap[e.id] = e;
        });
        const classType = obj.userData.classType || obj.userData.modelClass || '';
        const toolType = AnnotateType2ToolType[obj.type] || AnnotateType.RECTANGLE || '';

        let targetClassType: any;
        Object.keys(classIdMap).forEach((item: any) => {
            const tempObj = classIdMap?.[item];
            if (tempObj?.name == classType && tempObj?.toolType == toolType) {
                targetClassType = tempObj;
            }
        });

        const color = targetClassType ? targetClassType.color : obj.color || '#ffffff';

        return {
            color,
            toolType,
        };
    }

    return {
        noClassKey,
        state,
        onDeleteClassObject,
        onItemTool,
        onToggleClassVisible,
        onEditModelClass,
        filterValue,
        onToggleFilterVisible,
        toggleVisibleByFilter,
    };
}
