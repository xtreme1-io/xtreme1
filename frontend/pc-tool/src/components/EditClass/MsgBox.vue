<template>
    <div class="class-msg-box">
        <div class="content-wrap">
            <slot name="content" v-if="$slots.content"></slot>
        </div>
        <div class="btn">
            <a-button style="margin-right: 10px" @click="onCancel">{{ cancelText }}</a-button>
            <a-button type="primary" :danger="okDanger" @click="onOk">{{ okText }}</a-button>
        </div>
    </div>
</template>

<script setup lang="ts">
    interface IProps {
        cancelText: string;
        okText: string;
        okDanger: boolean;
    }

    // ***************Props and Emits***************
    let emit = defineEmits(['cancel', 'ok']);
    let props = withDefaults(defineProps<IProps>(), {
        cancelText: 'Cancel',
        okText: 'Ok',
        okDanger: false,
    });
    // *********************************************

    function onCancel() {
        emit('cancel');
    }
    function onOk() {
        emit('ok');
    }
</script>
