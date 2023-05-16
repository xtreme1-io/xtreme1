<template>
    <div class="sub-header">
        {{ $$('class-title') }}
        <span class="class-help" v-show="classInfo">
            <QuestionCircleOutlined />
            <div class="class-info">{{ classInfo }}</div>
        </span>
    </div>
    <div class="class-list">
        <div class="classType-tag-container">
            <a-tag
                class="classType-tag"
                @click="canEdit() ? onClassChange(item) : null"
                v-for="item in editor.state.classTypes"
                :style="style(item)"
                :key="item.name"
            >
                <i class="iconfont icon-lifangti" style="font-size: 14px"></i>
                {{ item.label }}
            </a-tag>
        </div>
    </div>
    <MsgInfo
        v-show="state.showMsgType === 'class' || state.showMsgType === 'class-standard'"
        @cancel="onCancel"
        @ok="onOk"
    >
        <template #msg>
            <span v-if="state.showMsgType === 'class'"
                >{{ $$('class-tip-info', { type: iState.newClassName }) }}
            </span>
            <span v-else>{{ $$('class-tip-info-standard', { type: iState.newClassName }) }} </span>
        </template>
    </MsgInfo>
</template>

<script setup lang="ts">
    import { reactive, computed, watch, nextTick, ref } from 'vue';
    import { IState } from './type';
    import { Const, IClassType } from 'pc-editor';
    import SelectClass from '../Common/selectClass.vue';
    import MsgInfo from './MsgInfo.vue';
    import { useInjectEditor } from '../../state';
    import * as THREE from 'three';
    import * as locale from './lang';
    import useUI from '../../hook/useUI';
    import { utils } from 'pc-editor';
    import { QuestionCircleOutlined } from '@ant-design/icons-vue';

    let { formatNumStr: format } = utils;

    function style(item: IClassType) {
        return item.id === iState.classType
            ? {
                  backgroundColor: '#177ddc',
                  color: '#ffffff',
              }
            : {
                  borderColor: item.color,
                  color: item.color,
                  backgroundColor: 'transparent',
              };
    }

    interface IOption {
        label: string;
        value: string;
    }

    // import useUI from 'pc-ui/hook/useUI';
    interface IProps {
        state: IState;
    }

    // ***************Props and Emits***************
    let emit = defineEmits(['change']);
    let props = defineProps<IProps>();
    // *********************************************
    let { canEdit } = useUI();
    let editor = useInjectEditor();
    let select = ref(null);
    let iState = reactive({
        classType: '',
        newClassType: '',
        newClassName: '',
    });

    let $$ = editor.bindLocale(locale);

    let classInfo = computed(() => {
        let classType = props.state.classType;
        let classConfig = editor.getClassType(classType);

        if (classConfig) {
            return getClassInfo(classConfig);
        } else {
            return '';
        }
    });

    watch(
        () => props.state.classType,
        () => {
            if (iState.classType !== props.state.classType) {
                iState.classType = props.state.classType;
            }
        },
        {
            immediate: true,
        },
    );

    function onClassChange(classConfig: IClassType) {
        editor.blurPage();

        // let classConfig = editor.state.classTypes.find((e) => e.id === value) as IClassType;

        iState.newClassType = classConfig.id;
        iState.newClassName = classConfig.label;
        if (!props.state.classType) {
            props.state.classType = iState.newClassType;
            props.state.showMsgType = '';
            emit('change');
            return;
        } else if (props.state.classType === classConfig.id) {
            props.state.showMsgType = '';
            return;
        }

        if (classConfig.type !== 'standard') {
            props.state.showMsgType = 'class';
        } else {
            props.state.showMsgType = 'class-standard';
        }

        nextTick(() => {
            // reset to old value
            iState.classType = props.state.classType;
        });
    }

    function onCancel() {
        props.state.showMsgType = '';
    }
    function onOk() {
        props.state.showMsgType = '';
        props.state.classType = iState.newClassType;
        emit('change');
    }

    function getClassInfo(classConfig: IClassType) {
        let $length = $$('class-length');
        let $height = $$('class-height');
        let $width = $$('class-width');
        let $points = $$('class-points');

        let points = classConfig.points;
        let items = [] as string[];
        if (classConfig.type === 'constraint' && classConfig.sizeMin && classConfig.sizeMax) {
            let sizeMin = classConfig.sizeMin as THREE.Vector3;
            let sizeMax = classConfig.sizeMax as THREE.Vector3;
            if (sizeMax.x || sizeMin.x)
                items.push(
                    `${$length}: ${sizeMin.x ? format(sizeMin.x) : '0.00'} - ${
                        sizeMax.x ? format(sizeMax.x) : '∞'
                    }`,
                );
            if (sizeMax.y || sizeMin.y)
                items.push(
                    `${$width}: ${sizeMin.y ? format(sizeMin.y) : '0.00'} - ${
                        sizeMax.y ? format(sizeMax.y) : '∞'
                    }`,
                );
            if (sizeMax.z || sizeMin.z)
                items.push(
                    `${$height}: ${sizeMin.z ? format(sizeMin.z) : '0.00'} - ${
                        sizeMax.z ? format(sizeMax.z) : '∞'
                    }`,
                );
            if (points) items.push(`${$points}: ${points[0] || ''} - ${points[1] || '∞'}`);
        } else if (classConfig.type === 'standard' && classConfig.size3D) {
            let size3D = classConfig.size3D as THREE.Vector3;
            if (size3D.x) items.push(`${$length}: ${size3D.x ? format(size3D.x) : ''}`);
            if (size3D.y) items.push(`${$width}: ${size3D.y ? format(size3D.y) : ''}`);
            if (size3D.z) items.push(`${$height}: ${size3D.z ? format(size3D.z) : ''}`);
            if (points) items.push(`${$points}: ${points[0] || ''} - ${points[1] || '∞'}`);
        }
        return items.join(' | ');
    }
</script>

<style lang="less" scoped>
    .classType-tag {
        margin-bottom: 8px;
        display: inline-block;
        min-width: 50px;
        text-align: center;
    }
    .class-label {
        display: inline-block;
        width: 200px;
    }
    .recent-title {
        color: #878787;
        font-weight: bold;
    }
    .recent-item:hover {
        background: rgba(255, 255, 255, 0.08);
    }

    .class-help {
        margin-left: 6px;
        cursor: pointer;
        position: relative;
        .class-info {
            display: none;
            width: 250px;
            background: #3e3e3e;
            padding: 2px;
            color: #b5b5b5;
            font-size: 12px;
            word-wrap: break-word;
            position: absolute;
            top: 23px;
            z-index: 10;
            left: -40px;
        }
        &:hover .class-info {
            display: inline-block;
        }
    }
    .divider-line {
        display: inline-block;
        width: 100%;
        border-top: 1px solid #aaaaaa;
    }
</style>
