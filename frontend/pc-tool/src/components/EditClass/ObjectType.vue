<template>
    <div class="sub-header">{{ $$('object-type') }}</div>
    <a-radio-group
        :value="state.resultType"
        :disabled="!canEdit() || state.isInvisible"
        @change="onTypeClick"
    >
        <a-radio-button v-for="item in typeList" v-model:value="item.value">{{
            item.label
        }}</a-radio-button>
    </a-radio-group>
    <MsgInfo v-show="state.showMsgType === 'type'" @cancel="onCancel" @ok="onOk">
        <template #msg>
            <span>{{ $$('type-tip-info', { type: iState.newTypeName }) }}</span>
        </template>
    </MsgInfo>
</template>

<script setup lang="ts">
    import { IState } from './type';
    import { Const } from 'pc-editor';
    import MsgInfo from './MsgInfo.vue';
    import { reactive, computed, ref } from 'vue';
    import { useInjectEditor } from '../../state';
    import * as locale from './lang';
    import useUI from 'pc-ui/hook/useUI';

    interface IProps {
        state: IState;
    }

    // ***************Props and Emits***************
    let emit = defineEmits(['change']);
    let props = defineProps<IProps>();
    // *********************************************
    let dom = ref(null as any as HTMLDivElement);
    let { canEdit } = useUI();
    let editor = useInjectEditor();
    let $$ = editor.bindLocale(locale);
    let iState = reactive({
        newType: '',
        newTypeName: '',
    });

    let typeList = computed(() => {
        const data = [
            { value: Const.Dynamic, label: $$('Dynamic') },
            { value: Const.Fixed, label: $$('Fixed') },
            // { value: Const.Standard, label: $$('Standard') },
        ];

        return data;
    });

    let onTypeClick = (e: any) => {
        // input blur
        // if (e.nativeEvent.target.blur) {
        //     e.nativeEvent.target.blur();
        // }
        editor.blurPage();

        let type = e.target.value as any;
        if (props.state.resultType === type) return;

        let item = typeList.value.find((e) => e.value === type) as any;

        iState.newType = type;
        iState.newTypeName = item.label || type;

        if (type === Const.Fixed) {
            props.state.showMsgType = 'type';
        } else {
            if (props.state.showMsgType === 'type') {
                props.state.showMsgType = '';
            }
            emit('change', type);
        }
    };

    function onCancel() {
        props.state.showMsgType = '';
    }
    function onOk() {
        props.state.showMsgType = '';
        emit('change', iState.newType);
    }
</script>
