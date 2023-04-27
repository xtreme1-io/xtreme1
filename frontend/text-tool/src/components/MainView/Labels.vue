<template>
    <div class="main-view-label">
        <div
            class="item"
            v-for="item in props.data"
            :style="{ transform: `translate(${item.x}px, ${item.y}px) scale(${item.scale})` }"
        >
            <span class="title">{{ item.name }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
    // ***************Props and Emits***************
    // const emit = defineEmits(['close']);
    let props = defineProps(['data']);
    // *********************************************
</script>

<style lang="less">
    .main-view-label {
        position: absolute;
        left: 0px;
        top: 0px;

        .item {
            pointer-events: none;
            user-select: none;
            position: absolute;
            font-size: 12px;
            width: 100px;
            text-align: center;
            margin-left: -50px;
            transform-origin: center;

            .title {
                background: rgb(255 0 0 / 64%);
                color: white;
            }
        }
    }
</style>
