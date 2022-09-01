<template>
    <div class="pc-loading" v-show="state.visible">
        <div v-show="state.type === 'loading'">
            <LoadingOutlined /><span>{{ state.content }}</span>
        </div>
        <div v-show="state.type === 'error'"
            >{{ editor.lang('load-error')
            }}<span class="retry">{{ editor.lang('retry') }}</span></div
        >
    </div>
</template>

<script setup lang="ts">
    import { reactive, ref } from 'vue';
    import { useInjectEditor } from '../../state';
    import { ILoadingOption, StatusType } from 'pc-editor';
    import { LoadingOutlined } from '@ant-design/icons-vue';

    // ***************Props and Emits***************
    // const emit = defineEmits(['close']);
    // let props = defineProps(['data']);
    // *********************************************

    type IType = 'loading' | 'error';

    let editor = useInjectEditor();
    let state = reactive({
        visible: false,
        content: editor.lang('load-point'),
        type: 'error' as IType,
        // type: 'loading' as IType,
    });

    editor.showLoading = (config) => {
        if (config === true) {
            editor.state.status = StatusType.Loading;
            state.visible = true;
            state.content = '';
            state.type = 'loading';
        } else if (config === false) {
            state.visible = false;
            editor.state.status = StatusType.Default;
        } else {
            editor.state.status = StatusType.Loading;
            state.visible = true;
            state.content = config.content;
            state.type = config.type;
        }
    };
</script>

<style lang="less">
    .pc-loading {
        position: absolute;
        inset: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        background: rgb(51 51 51 / 90%);
        color: #a2a2a2;
        font-size: 12px;
        z-index: 1000;

        .anticon {
            font-size: 30px;
            color: #177ddc;
            margin-right: 10px;
        }

        .retry {
            color: #177ddc;
            text-decoration: underline;
            cursor: pointer;
        }
    }
</style>
