<template>
    <div class="modal-confirm" style="padding-left: 40px">
        <div style="font-size: 16px; line-height: 32px"> {{ data.content }}</div>
        <div style="font-size: 14px; line-height: 24px"> {{ data.subContent }}</div>

        <div style="text-align: right; margin-top: 20px">
            <a-button
                v-if="iConfig.btns.includes('ok')"
                type="primary"
                style="width: 100px; margin-left: 10px"
                @click="onOk"
            >
                {{ iConfig.okText }}
            </a-button>
            <a-button
                v-if="iConfig.btns.includes('discard')"
                danger
                ghost
                @click="onDiscard"
                style="width: 100px; margin-left: 10px"
            >
                {{ iConfig.discardText }}
            </a-button>
            <a-button
                v-if="iConfig.btns.includes('discard')"
                type="default"
                @click="onCancel"
                style="width: 100px; margin-left: 10px"
            >
                {{ iConfig.cancelText }}
            </a-button>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { CloseOutlined } from '@ant-design/icons-vue';
    import { reactive, computed, watch, ref } from 'vue';
    type btnType = 'ok' | 'cancel' | 'discard';
    interface IProps {
        content: string;
        subContent: string;
        okText: string;
        cancelText: string;
        discardText: string;
        btns: btnType[];
    }
    const defaultConfig: IProps = {
        content: '',
        subContent: '',
        okText: 'Ok',
        cancelText: 'Cancel',
        discardText: 'Discard',
        btns: ['ok', 'cancel', 'discard'],
    };
    // ***************Props and Emits***************
    const emit = defineEmits(['cancel', 'ok']);
    const props = defineProps<{
        data: IProps;
    }>();
    const status = ref<btnType>('cancel');
    // ***************Props and Emits*************
    const iConfig = computed(() => {
        return Object.assign(defaultConfig, props.data || {});
    });
    function valid(): Promise<boolean> {
        return Promise.resolve(true);
    }
    function onCancel() {
        status.value = 'cancel';
        emit('cancel');
    }
    function onOk() {
        status.value = 'ok';
        emit('ok');
    }
    function onDiscard() {
        status.value = 'discard';
        emit('ok');
    }

    function getData(): any {
        return status.value;
    }

    defineExpose({
        valid,
        getData,
    });
</script>

<style lang="less">
    .modal-model-run {
        padding: 0 40px;
        .ant-row {
            display: flex;
            align-items: center;
            min-height: 40px;
        }
    }
</style>
