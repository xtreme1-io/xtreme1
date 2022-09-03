import { reactive, ref, createVNode, onMounted, onBeforeUnmount, nextTick } from 'vue';
import * as _ from 'lodash';
import { IUserData, Event, ToolType2AnnotatteType } from 'editor';
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
        // console.log(objects);

        state.objectN = objects.length;
        editorState.allVisible =
            objects.length > 0 ? !objects.every((item: any) => !item.visible) : true;

        // class config
        let classConfigMap: Record<string, any> = {};
        editorState.classTypes.forEach((e) => {
            classConfigMap[e.name] = e;
        });

        // exist info
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

        // add info
        let objectMap: Record<string, Record<string, IItem>> = {};
        objects.forEach((obj: any) => {
            let uuid = obj.uuid;
            let classType = obj.userData.classType || obj.userData.modelClass || '';
            // 判断 allFilter 是否包含当前 classType，如果不包含则表明是新绘制的 类型
            if (!allFilter.value.includes(classType)) {
                // 记录当前 新的classType
                allFilter.value.push(classType);
                // 将当前 新的 classType 加入到筛选中
                filterValue.value.push(classType);
                // 但是树形数据那里没有勾选上
                // 现在是筛选后的数据时正常的，但是勾选项不正常
                // 可以尝试以筛选后的数据去反向改变勾选项
                // 但是，如果新增类型再删除该类型，那么该类型就不算新增了
                // 如果此时再新增该类型的数据，就不会触发这里的代码
                // 那这里就要在每次删除后都去重新遍历获取 allFilter
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

                // 判断 filterVisible
                item.filterVisible =
                    filterValue.value.includes(FilterEnum.class) ||
                    filterValue.value.includes(filterClassType);

                // 判断为模型
                if (obj.userData?.modelClass) {
                    item.isModel = true;
                    // 判断 filterVisible
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

                // 判断 filterVisible
                item.filterVisible =
                    filterValue.value.includes(FilterEnum.class) ||
                    filterValue.value.includes(filterClassType);

                // 判断为模型
                if (obj.userData?.modelClass) {
                    item.isModel = true;
                    // 判断 filterVisible
                    item.filterVisible =
                        filterValue.value.includes(FilterEnum.predictedClass) ||
                        filterValue.value.includes(filterClassType);
                }

                // 没有对应的 class 映射
                if (!classMap[classType]) {
                    let color = classConfigMap[classType]
                        ? classConfigMap[classType].color
                        : obj.color || '#ffffff';
                    // let bgColor = colord(color).alpha(0.3).toRgbString();
                    let insList: IInstanceList = {
                        classType,
                        color,
                        annotateType: ToolType2AnnotatteType[classConfigMap[classType]?.toolType],
                        // bgColor,
                        data: [],
                        visible: true,
                        isModel: item.isModel,
                        filterVisible: true,
                    };

                    // 判断 filterVisible
                    insList.filterVisible =
                        filterValue.value.includes(FilterEnum.class) ||
                        filterValue.value.includes(filterClassType);
                    // 判断为模型
                    if (item.isModel) {
                        insList.isModel = true;
                        // 判断 filterVisible
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

        // filter
        filterInfo(state.noClassList, objectMap);
        // console.log('state', state);
        state.list = state.list.filter((info) => {
            filterInfo(info, objectMap);
            return info.data.length;
        });
        selectedScrollToView();

        // console.log('update editor:', editor);
        // console.log('updated state:', state);
        // const selectedShapeId = editor?.tool?.selectedShape?.uuid;
        // const select = state.select;
        // NOTE 绘制形状后立即筛选
        // -- 会导致被筛选掉的状立即消失
        // -- 下面通过 state.select 解决立即消失的问题
        toggleVisibleByFilter();
    }, 100);

    function selectedScrollToView() {
        // 选中的 需要进入可视范围
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
                // if (!e.visible) hasNoVisible = true;
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

        // let objects = pc.getAnnotate3D();
        // let finds = objects.filter((e) => idMap[e.uuid]);
        // if (finds.length > 0) {
        //     editor.dispatchEvent({ type: EditorEvent.SHOW_CLASS_INFO, data: { object: finds } });
        // }
    }

    // 切换某一类形状
    function onToggleClassVisible(item: IInstanceList) {
        // 先判断这一类是否被过滤，再判断其是否可见
        // -- 如果被过滤掉，则 visible 始终为 false
        // -- 否则，执行后面的 !visible
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
        // if (state.select.includes(item.id) || !item.visible) return;
        editor.tool?.selectShapeById(item.id, e ? e.shiftKey : false);
        // console.log(state);
        // toggleVisibleByFilter();
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

        // 筛选 noClassList
        // if (!allFilter.value.includes(state.noClassList.classType as FilterEnum)) {
        //     allFilter.value.push(state.noClassList.classType as FilterEnum);
        //     filterValue.value.push(state.noClassList.classType as FilterEnum);
        // }

        // 通过 filterValue 来判断当前 noClassList 的 filterVisible
        // -- 同时会改变 visible 的值
        state.noClassList.filterVisible =
            filterValue.value.includes(FilterEnum.class) ||
            filterValue.value.includes(FilterEnum.noClass);
        state.noClassList.visible = state.noClassList.filterVisible;

        state.noClassList.data.forEach((shape: any) => {
            shape.filterVisible = state.noClassList.filterVisible;
            shape.visible = shape.filterVisible;
        });

        // 筛选 classList
        state.list.forEach((item: any) => {
            // if (!allFilter.value.includes(item.classType as FilterEnum)) {
            //     allFilter.value.push(item.classType as FilterEnum);
            //     filterValue.value.push(item.classType as FilterEnum);
            // }
            // 通过 filterValue 来判断当前 list 的 filterVisible
            // -- 同时会改变 visible 的值
            // -- 需要区分 模型跑出来的数据
            // -- 模型全选标识不一样，所以需要分开判断
            if (item.isModel) {
                if (
                    filterValue.value.includes(FilterEnum.predictedClass) ||
                    filterValue.value.includes(item.classType)
                ) {
                    item.filterVisible = true;
                    item.visible = true;
                    // 需要遍历内部数据
                    item.data.forEach((shape: any) => {
                        shape.filterVisible = true;
                        shape.visible = true;
                    });
                } else {
                    item.filterVisible = false;
                    item.visible = false;
                    // 需要遍历内部数据
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
                    // 需要遍历内部数据
                    item.data.forEach((shape: any) => {
                        shape.filterVisible = true;
                        shape.visible = true;
                    });
                } else {
                    item.filterVisible = false;
                    item.visible = false;
                    // 需要遍历内部数据
                    item.data.forEach((shape: any) => {
                        shape.filterVisible = false;
                        shape.visible = false;
                    });
                }
            }
        });
    }

    // 切换显示，isAllVisible只会在切换顶部时才会传入
    function toggleVisibleByFilter(isAllVisible?: boolean) {
        console.log('toggleVisibleByFilter');
        // 无 class 将当前筛选之后的形状的 id 提取出来
        const currentNoClassIds: string[] = [];
        state.noClassList.data.forEach((item: any) => {
            if (!_.isUndefined(isAllVisible)) item.visible = isAllVisible;
            if (item.filterVisible && item.visible) currentNoClassIds.push(item.id);
        });

        // 有 class 将当前筛选之后的形状的 id 提取出来
        const currentHasClassIds: string[] = [];
        state.list.forEach((item: any) => {
            item.data.forEach((child: any) => {
                if (!_.isUndefined(isAllVisible)) child.visible = isAllVisible;
                if (child.filterVisible && child.visible) currentHasClassIds.push(child.id);
            });
        });
        // 比较和上次数据是否一致，防止循环调用
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
        // 存储当前值，下次作比较
        lastNoClassList.value = _.cloneDeep(state.noClassList.data);
        lastHasClassList.value = _.cloneDeep(state.list);
        allVisible.value = editorState.allVisible;

        // 然后通过 setVisible 来设置是否可见，先全部隐藏，再局部显示
        editor.setVisible([], false);
        if (currentNoClassIds.length > 0 || currentHasClassIds.length > 0) {
            editor.setVisible([...currentNoClassIds, ...currentHasClassIds], isAllVisible ?? true);
        }

        // 单独设置最后一个绘制的形状 为显示状态
        // -- 防止刚画出的形状立即消失
        if (state.select.length > 0) {
            // 和选中形状一起判断，但这会导致AI识别出来的多边形消失
            // -- 因为识别出来的多边形不会被选中
            // if (state.select[0] == editor?.tool?.selectedShape?.uuid) {
            //     editor.setVisible(state.select, true);
            // }
            console.log('select', state);
            const selectId = state.select[0];
            // state.select = [];
            // toggleVisibleByFilter();
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
                    // flag2 = item.data.some((child) => child.id == selectId);
                    // editor.setVisible([selectId], item.visible);
                }
            });
            // editor.setVisible(state.select, true);
        }
    }

    function changeImage() {
        const defaultFilter = [FilterEnum.class, FilterEnum.predictedClass];
        onToggleFilterVisible(defaultFilter);
    }

    function resetStateSelect() {
        const selectId = state.select[0];
        console.log('reset state select', state.select);
        // state.select = [];
        // toggleVisibleByFilter();
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
                // flag2 = item.data.some((child) => child.id == selectId);
                // editor.setVisible([selectId], item.visible);
            }
        });
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
