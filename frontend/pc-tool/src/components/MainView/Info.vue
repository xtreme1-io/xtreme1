<template>
    <div class="main-view-info">
        <div v-show="state.visible">
            <div class="item" style="border-bottom: 1px solid #626262"
                ><span class="title">{{ $$('info-name') }}：</span>{{ state.name }}</div
            >
            <div class="item"
                ><span class="title">{{ $$('info-l') }}：</span>{{ state.lMin }}~{{ state.lMax }} -
                {{ formatNumber(state.size.x) }}</div
            >
            <div class="item"
                ><span class="title">{{ $$('info-w') }}：</span>{{ state.wMin }}~{{ state.wMax }} -
                {{ formatNumber(state.size.y) }}</div
            >
            <div class="item"
                ><span class="title">{{ $$('info-h') }}：</span>{{ state.hMin }}~{{ state.hMax }} -
                {{ formatNumber(state.size.z) }}</div
            >
            <div class="item"
                ><span class="title">{{ $$('info-point') }}：</span>{{ state.pointN }}</div
            >
            <div class="item"
                ><span class="title">{{ $$('info-position') }}：</span
                >{{
                    `${formatNumber(state.position.x)},${formatNumber(
                        state.position.y,
                    )},${formatNumber(state.position.z)}`
                }}</div
            >
        </div>
        <Setting />
    </div>
</template>

<script setup lang="ts">
    import { onMounted, onBeforeUnmount, reactive } from 'vue';
    import { Points, Event, Box } from 'pc-render';
    import { useInjectEditor } from '../../state';
    import * as _ from 'lodash';
    import * as THREE from 'three';
    import { formatNumber } from '../../utils';
    import { utils } from 'pc-editor';
    // import { CloseCircleOutlined } from '@ant-design/icons-vue';
    import { IUserData, StatusType } from 'pc-editor';
    import * as locale from './lang';
    import Setting from './setting.vue';

    // ***************Props and Emits***************

    // *********************************************

    let editor = useInjectEditor();
    const $$ = editor.bindLocale(locale);
    let pc = editor.pc;
    let state = reactive({
        visible: false,
        name: '',
        pointN: 0,
        size: new THREE.Vector3(),
        position: new THREE.Vector3(),
        //
        lMin: '' as any,
        wMin: '' as any,
        hMin: '' as any,
        lMax: '' as any,
        wMax: '' as any,
        hMax: '' as any,
    });

    let update = _.throttle(() => {
        let obj = pc.selection.find((item) => item instanceof Box) as Box;
        if (!obj || pc.groupPoints.children.length === 0) {
            state.visible = false;
            return;
        }
        let points = pc.groupPoints.children[0] as Points;
        let positions = points.geometry.attributes['position'] as THREE.BufferAttribute;
        let pointN = utils.computePointN(obj, positions);
        // console.timeEnd('update');
        setStateName(obj.userData);
        // state.name = obj.userData.classType || obj.userData.modelClass || $$('info-empty');
        state.pointN = pointN;
        state.size.copy(obj.scale);
        state.position.copy(obj.position);
        state.visible = true;

        obj.userData.pointN = pointN;
    }, 200);

    function onSelect() {
        let selection = pc.selection;
        if (selection.length === 0 && editor.state.status === StatusType.Play) return;
        update();
    }

    function setStateName(userData: IUserData) {
        if (!userData) return;
        const classTypes = editor.state.classTypes;
        const empty = $$('info-empty');
        const modelInfo = $$('info-model');
        let classType = empty;

        state.lMin = 0;
        state.lMax = $$('info-infinity');
        state.wMin = 0;
        state.wMax = state.lMax;
        state.hMin = 0;
        state.hMax = state.lMax;

        if (userData.classType) {
            let config = editor.getClassType(userData);
            if (config) classType = config.label || config.name;
            if (config?.type === 'constraint') {
                let sizeMin = config.sizeMin as THREE.Vector3;
                let sizeMax = config.sizeMax as THREE.Vector3;
                state.lMin = sizeMin.x || '';
                state.wMin = sizeMin.y || '';
                state.hMin = sizeMin.z || '';
                state.lMax = sizeMax.x || '';
                state.wMax = sizeMax.y || '';
                state.hMax = sizeMax.z || '';
            } else if (config?.type === 'standard') {
                let size3D = config.size3D as THREE.Vector3;
                state.lMin = size3D.x || '';
                state.wMin = size3D.y || '';
                state.hMin = size3D.z || '';
                state.lMax = size3D.x || '';
                state.wMax = size3D.y || '';
                state.hMax = size3D.z || '';
            }
        } else if (userData.modelClass) {
            classType = `${userData.modelClass}(${modelInfo})`;
        }
        state.name = classType;
    }

    onMounted(() => {
        editor.pc.addEventListener(Event.OBJECT_TRANSFORM, update);
        editor.pc.addEventListener(Event.SELECT, onSelect);
        editor.pc.addEventListener(Event.USER_DATA_CHANGE, update);
    });

    onBeforeUnmount(() => {
        editor.pc.removeEventListener(Event.OBJECT_TRANSFORM, update);
        editor.pc.removeEventListener(Event.SELECT, onSelect);
        editor.pc.removeEventListener(Event.USER_DATA_CHANGE, update);
    });
</script>

<style lang="less">
    .main-view-info {
        position: absolute;
        left: 16px;
        top: 16px;
        color: #cdd3da;
        pointer-events: none;
        user-select: none;

        .item {
            font-size: 12px;
            text-align: left;
            line-height: 20px;
        }
    }
</style>
