<template>
    <div class="main-class-edit" v-show="config.showClassView">
        <EditClass :show-close="true" />
    </div>
</template>

<script setup lang="ts">
    import EditClass from '../index.vue';
    import { useInjectEditor } from '../../../state';
    import { IControl } from '../type';
    import { useProvideControl } from '../useControl';

    let editor = useInjectEditor();
    let { config } = editor.state;

    let control: IControl = {
        needUpdate() {
            return !config.showCheckView;
        },
        close() {
            config.showClassView = false;
        },
        open() {
            config.showClassView = true;
        },
    };
    useProvideControl(control);
</script>

<style lang="less">
    .main-class-edit {
        position: absolute;
        right: 0px;
        bottom: 20px;
        width: 400px;
        background: #1e1f23;
        padding: 10px 0px;
        text-align: left;
        z-index: 4;
    }
</style>
