<template>
    <div
        class="main-view-class"
        ref="editClass"
        v-show="state.objectId && editorState.showClassView"
        :style="classEditStyle"
    >
        <h2 class="class-title border-bottom"> {{ _.upperFirst(state.annotateType) }} Class </h2>
        <div class="class-list border-bottom" v-if="filteredClassTypes.length">
            <span
                :title="item.name"
                :class="state.classType === item.name ? 'item limit active' : 'item limit'"
                @click="onChange(item.name)"
                v-for="item in filteredClassTypes"
                :key="item.name"
                :style="{ color: item.color }"
            >
                <i :class="`iconfont icon-${state.annotateType}`"></i>{{ item.name }}
                <!-- <DisconnectOutlined />{{ item.name }} -->
            </span>
        </div>
        <div v-if="!state.classType" style="color: #ccc">No Class Data</div>
        <div v-else class="attr-container">
            <div
                class="attr-item"
                v-for="item in state.attrs"
                :key="state.objectId + state.classType + item.name"
            >
                <AttrValue @change="onAttChange" :item="(item as any)" :isDisable="false" />
            </div>
        </div>
        <CloseCircleOutlined @click="onClose" class="close" />
    </div>
</template>

<script setup lang="ts">
    import { reactive, onMounted, onBeforeUnmount, computed, nextTick, watch, ref } from 'vue';
    import {
        AttrType,
        IAttr,
        IClassType,
        Event,
        AnnotateType,
        AnnotateType2ToolType,
    } from 'editor';
    import { useInjectTool } from '../../state';
    import { DisconnectOutlined, CloseCircleOutlined } from '@ant-design/icons-vue';
    import * as _ from 'lodash';

    import AttrValue from './sub/AttrValue.vue';
    // ***************Props and Emits***************
    // const emit = defineEmits(['close']);
    // let props = defineProps(['data']);
    // *********************************************

    interface IAttrItem extends IAttr {
        value: any;
    }
    interface IEditClassState {
        classType: string;
        objectId: string;
        annotateType: AnnotateType | '';
        attrs: IAttrItem[];
        value: any;
    }
    type AnnotateObject = any;

    let tool = useInjectTool();
    let editor = tool.editor;
    let editorState = tool.editor.state;
    let state = reactive<IEditClassState>({
        value: '',
        objectId: '',
        annotateType: '',
        classType: '',
        attrs: [],
    });
    const editClass = ref<HTMLDivElement | null>(null);
    let classEditStyle = reactive({ left: '0', top: '0' });

    //  和图形类型匹配的 class
    let filteredClassTypes = computed(() => {
        return editorState.classTypes.filter((item) => {
            return item.toolType === AnnotateType2ToolType[state.annotateType];
        });
    });
    watch(
        [editorState.classEditStyle, state, editorState.showClassView],
        () => {
            nextTick(() => {
                if (editorState.showClassView) {
                    let rect: any;
                    let parentRect: any;
                    if (editClass.value) {
                        rect = editClass.value.getBoundingClientRect();
                        parentRect = editClass.value.parentElement?.getBoundingClientRect();
                    }
                    // console.log(rect, parentRect);
                    let target = editorState.classEditStyle;
                    let left = target.x + target.width;
                    let top = target.y;
                    if (left + rect?.width > parentRect?.width) {
                        left = parentRect?.width - rect?.width;
                    }
                    if (top + rect?.height > parentRect?.height) {
                        top = parentRect?.height - rect?.height;
                    }
                    classEditStyle.left = Math.floor(left) + 'px';
                    classEditStyle.top = Math.floor(top) + 'px';
                }
                if (!editorState.showClassView) {
                    state.classType = '';
                    state.objectId = '';
                    state.annotateType = '';
                }
            });
        },
        { deep: true },
    );
    editor.on(Event.SHOW_CLASS_INFO, (data: any) => {
        let object = data.data.object;
        showObject(object);
        editorState.showClassView = true;
    });
    editor.on(Event.SELECT, onSelect);
    editor.on(Event.REMOVE_OBJECT, (data) => {
        if (state.objectId && data.data.removed.includes(state.objectId)) {
            onClose();
        }
    });
    editor.on(Event.CLEAR_DATA, (data) => {
        onClose();
    });
    function onClose() {
        editorState.showClassView = false;
    }

    function onChange(name: string) {
        if (!state.objectId) return;

        let obj = editor.tool?.shapes.getItemById(state.objectId);
        state.classType = name;
        const toolType = AnnotateType2ToolType[obj.type];

        let classConfig = _.find(
            editorState.classTypes,
            (e) => e.name === name && e.toolType == toolType,
        ) as IClassType;
        obj.updateClassType({ attrs: {}, classType: state.classType, color: classConfig.color });
        updateAttrInfo(obj as any, state.classType);
    }

    function onSelect(data: any) {
        // console.log('select data', data);
        // class
        let selection = data.data.curSelection as AnnotateObject[];
        if (selection.length > 0) {
            // state.classType = selection[0].userData.classType;
            // state.objectId = selection[0].userData.id + '';
            // state.annotateType = selection[0].annotateType;

            showObject(selection[0]);
        } else {
            onClose();
            state.classType = '';
            state.objectId = '';
            state.annotateType = '';
        }

        // attr
        // if (selection.length > 0) {
        //     let object = selection[0];
        //     let userData = object.userData;
        //     let classType = userData.classType || '';
        //     classType && updateAttrInfo(object, classType);
        // }
    }

    function showObject(object: AnnotateObject) {
        let userData = object.userData;
        state.classType = userData.classType;
        state.objectId = object.uuid;
        state.annotateType = object.type;
        editorState.classEditStyle = object.shape.getClientRect();
        let classType = userData.classType || '';
        classType && updateAttrInfo(object, classType);
    }
    let onAttChange = _.debounce((name: string, value: any) => {
        if (!state.objectId) return;
        let object = editor.tool?.shapes.getItemById(state.objectId);

        if (!object) return;

        if (!object.userData.attrs) object.userData.attrs = {};
        // object.userData.attrs[name] = value;
        let attrs = JSON.parse(JSON.stringify(object.userData.attrs));
        // console.log(attrs);

        attrs[name] = value;
        object.updateAttrs(attrs);
    }, 100);

    function updateAttrInfo(object: AnnotateObject, classType: string) {
        const toolType = AnnotateType2ToolType[object.type];
        let classConfig = _.find(
            editorState.classTypes,
            (e) => e.name === classType && e.toolType == toolType,
        );
        // console.log('updateAttrInfo', classConfig);

        if (!classConfig) return;

        if (!object.userData.attrs) object.userData.attrs = {};
        let attrs = object.userData.attrs;

        let newAttrs = classConfig.attrs.map((e: any) => {
            let defaultValue = e.type === AttrType.MULTI_SELECTION ? [] : '';
            return { ...e, value: e.id in attrs ? attrs[e.id] : defaultValue };
        });
        // console.log(newAttrs);
        state.attrs = newAttrs;
    }
</script>

<style lang="less">
    .main-view-class {
        position: absolute;
        // right: 0px;
        // bottom: 20px;
        width: 400px;
        min-height: 200px;
        background: #1e1f23;
        padding: 20px;
        .class-title {
            text-align: left;
            font-size: 14px;
            padding-bottom: 10px;
        }
        .attr-container {
            margin-top: 4px;
            max-height: 300px;
            overflow: auto;
        }

        .close {
            position: absolute;
            right: 10px;
            top: 10px;
        }

        .class-list {
            text-align: left;
        }

        .attr-item {
            text-align: left;
            .name {
                font-size: 16px;
                line-height: 34px;
            }

            .value {
                padding: 4px 0px;
            }
        }

        .item {
            background: #303036;
            padding: 4px 6px;
            margin-right: 8px;
            margin-bottom: 8px;
            white-space: nowrap;
            border-radius: 3px;
            display: inline-block;
            cursor: pointer;
            vertical-align: middle;
            max-width: 140px;

            .anticon,
            .iconfont {
                margin-right: 4px;
            }

            &.active,
            &:hover {
                background: #2e8cf0;
                color: white !important;
            }
        }
    }
</style>
