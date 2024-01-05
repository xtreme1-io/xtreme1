<template>
    <div class="bottom-right-click-menu">
        <a-checkbox v-model:checked="iState.checked"
            ><span class="mark-gone">标记为消失</span></a-checkbox
        >
        <!-- <div class="menu-item">标记为消失</div> -->
    </div>
</template>
<script lang="ts" setup>
    import { reactive } from 'vue';
    const props = defineProps<{
        data: {
            invisible: boolean;
        };
    }>();
    const iState = reactive({
        checked: props.data.invisible,
    });
    const emit = defineEmits(['cancel', 'ok']);
    function valid(): Promise<boolean> {
        return Promise.resolve(true);
    }
    function getData(): any {
        return {
            ...iState,
        };
    }
    defineExpose({
        valid,
        getData,
    });
</script>
<style lang="less">
    .bottom-right-click-menu {
        width: 120px;
        min-height: 30px;
        background-color: rgb(255 255 255);
        padding: 4px 0 0 4px;
        color: #1e1f23;
        box-shadow: 0 0 10px -2px #1e1f23;
        .menu-item {
            padding: 0 8px;
            line-height: 32px;
            &:hover {
                background-color: #1e1f2349;
                color: white;
            }
        }
        .mark-gone {
            color: @primary-color;
            user-select: none;
        }
    }
</style>
