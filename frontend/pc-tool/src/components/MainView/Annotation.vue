<template>
    <div class="main-view-annotation">
        <div
            class="item limit"
            v-for="item in props.data"
            :title="item.name"
            :style="{ transform: `translate(${item.x}px, ${item.y}px) scale(${item.scale})` }"
        >
            <span class="title"><CommentOutlined style="margin-right: 4px" />{{ item.name }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { reactive, onMounted, onBeforeUnmount } from 'vue';
    import { useInjectState } from '../../state';
    import { CommentOutlined } from '@ant-design/icons-vue';
    // ***************Props and Emits***************
    // const emit = defineEmits(['close']);
    let props = defineProps(['data']);
    // *********************************************
</script>

<style lang="less">
    .main-view-annotation {
        position: absolute;
        left: 0px;
        top: 0px;

        .item {
            pointer-events: none;
            user-select: none;
            position: absolute;
            // font-size: 16px;
            width: 120px;
            text-align: center;
            margin-left: -60px;
            transform-origin: center;

            .title {
                pointer-events: visible;
                background: white;
                color: #1890ff;
                padding: 4px 6px;
                border-radius: 4px;
                cursor: pointer;
            }
        }
    }
</style>
