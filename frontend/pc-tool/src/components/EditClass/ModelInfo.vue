<template>
    <div v-show="state.isBatch">
        <!-- <div> -->
        <div class="item-header">
            <span class="title1">{{ $$('model-instance') }}</span>
            <template v-if="state.filterInstances.length > 0 && canEdit()">
                <EyeInvisibleOutlined
                    v-if="!state.batchVisible"
                    class="title-icon"
                    @click="onToggleObjectsVisible"
                />
                <EyeOutlined v-else class="title-icon" @click="onToggleObjectsVisible" />
                <DeleteOutlined class="title-icon" @click="onRemoveObjects" />
            </template>
        </div>
        <div class="instance-list">
            <template v-if="state.filterInstances.length > 0">
                <Instance
                    @remove="onInstanceRemove(item)"
                    :item="item"
                    v-for="item in state.filterInstances"
                />
            </template>
            <div v-else style="color: #7c7c7c">{{ $$('no-data') }}</div>
        </div>
        <div class="item-header" v-show="state.instances.length > 1">
            <span class="title1">{{ $$('model-confidence') }}</span>
            <a-slider
                style="width: 200px; margin-left: 30px"
                range
                v-model:value="state.confidenceRange"
                :step="0.01"
                :min="0"
                :max="1"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { IState } from './type';
    import useUI from '../../hook/useUI';
    import {
        EyeOutlined,
        DeleteOutlined,
        CloseCircleOutlined,
        FileMarkdownOutlined,
        EyeInvisibleOutlined,
        CopyOutlined,
    } from '@ant-design/icons-vue';
    import { useInjectEditor } from '../../state';
    import Instance from './Instance.vue';
    import * as locale from './lang';

    interface IProps {
        state: IState;
    }

    // ***************Props and Emits***************
    let emit = defineEmits(['visible', 'delete', 'instance-delete']);
    let props = defineProps<IProps>();
    // *********************************************
    let editor = useInjectEditor();
    let $$ = editor.bindLocale(locale);

    let { canEdit } = useUI();
    function onToggleObjectsVisible() {
        emit('visible');
    }
    function onRemoveObjects() {
        emit('delete');
    }
    function onInstanceRemove(item: any) {
        emit('instance-delete', item);
    }
</script>
