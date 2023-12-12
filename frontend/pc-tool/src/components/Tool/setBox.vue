<template>
    <a-tooltip
        overlayClassName="box-tooltip"
        trigger="click"
        placement="right"
        v-model:visible="iState.visible"
    >
        <span
            class="item"
            :style="{
                'border-top-right-radius': 0,
                'border-top-left-radius': 0,
                'padding-bottom': '2px',
                'padding-top': 0,
                color: iState.visible ? 'rgb(23, 125, 220)' : '',
            }"
            :title="$$('btn_setting')"
        >
            <EllipsisOutlined style="font-size: 14px; border-top: 1px solid #4e4e4e" />
        </span>
        <template #title>
            <div class="tool-btn-tooltip">
                <div
                    :title="$$('title_3d_default')"
                    :class="config.boxMethod === 'STANDARD' ? 'active tool-btn' : 'tool-btn'"
                    @click="toggleBoxMethod('STANDARD')"
                >
                    <i class="iconfont icon-biaozhunkuang"></i>
                </div>
                <div
                    :title="$$('title_3d_ai')"
                    :class="config.boxMethod === 'AI' ? ' active tool-btn' : 'tool-btn'"
                    @click="toggleBoxMethod('AI')"
                >
                    <i class="iconfont icon-a-aikuang"></i>
                </div>
            </div>
        </template>
    </a-tooltip>
</template>
<script lang="ts" setup>
    import { EllipsisOutlined } from '@ant-design/icons-vue';

    import { reactive } from 'vue';
    import { useInjectEditor } from '../../state';
    import * as locale from './lang';

    // ***************Props and Emits***************
    const iState = reactive({
        visible: false,
    });
    // ***************Props and Emits***************
    const editor = useInjectEditor();
    let $$ = editor.bindLocale(locale);
    const config = editor.state.config;
    function toggleBoxMethod(method: 'AI' | 'STANDARD') {
        config.boxMethod = method;
    }
</script>
