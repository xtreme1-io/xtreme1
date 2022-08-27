<template>
    <a-modal
        wrapClassName="base-modal"
        v-model:visible="state.visible"
        :title="state.title"
        :width="state.option.width"
        :footer="null"
        :destroyOnClose="true"
        :closable="state.option.closable"
        @cancel="onModalCancel"
    >
        <component
            v-if="state.modalName && modals[state.modalName]"
            :is="modals[state.modalName]"
            :data="state.modalData"
            @ok="onOk"
            @cancel="onCancel"
            ref="child"
        ></component>
    </a-modal>
</template>

<script setup lang="ts">
    import { reactive, ref } from 'vue';
    import type { Component } from 'vue';
    import { StatusType } from 'pc-editor';
    import { useInjectEditor } from '../../state';
    import injectConfirm from './Confirm';
    import injectMessage from './Message';

    const modals: Record<string, Component> = {};
    // ***************Props and Emits***************
    // const emit = defineEmits(['close']);
    // let props = defineProps(['data']);
    // *********************************************

    interface IChild {
        valid: () => Promise<boolean>;
        getData: () => any;
    }

    let editor = useInjectEditor();
    let okCallBack: any = null;
    let cancelCallBack: any = null;
    // let modalData: any = undefined;
    let child = ref<IChild>({} as IChild);
    let state = reactive({
        visible: false,
        title: '',
        modalName: '',
        modalData: undefined as any,
        option: {
            width: 520,
            closable: true,
        },
    });

    injectConfirm(editor);
    injectMessage(editor);

    function onOk() {
        console.log('onOk');
        okCallBack && okCallBack();
    }

    function onModalCancel() {
        console.log('onModalCancel');
        cancelCallBack && cancelCallBack();
    }

    function onCancel() {
        console.log('onCancel');
        cancelCallBack && cancelCallBack();
    }

    function close() {
        state.visible = false;
    }

    function show() {
        state.visible = true;
    }

    editor.registerModal = (name: string, modal: Component) => {
        modals[name] = modal;
    };

    editor.showModal = (name, option = { title: '' }) => {
        if (name === false) {
            state.visible = false;
            return Promise.resolve();
        }

        let modal = modals[name];
        editor.state.status = StatusType.Modal;
        return new Promise((resolve, reject) => {
            if (!modal) return reject({ msg: ` modal ${name} not exist` });

            state.modalData = option.data;
            state.modalName = name;
            state.title = option.title;
            state.option.width = option.width || 520;
            state.option.closable = typeof option.closable === 'boolean' ? option.closable : true;

            show();
            okCallBack = async () => {
                let data = null;
                let valid = false;

                try {
                    valid = await child.value.valid();
                } catch (e) {
                    console.log(e);
                    valid = false;
                }

                if (valid) {
                    try {
                        data = child.value.getData();
                    } catch (e) {
                        console.log(e);
                        return;
                    }

                    editor.state.status = StatusType.Default;
                    close();
                    resolve(data);
                }
            };
            cancelCallBack = () => {
                state.modalName = '';
                close();
                editor.state.status = StatusType.Default;
                reject({ msg: 'cancel' });
            };
        });
    };
</script>

<style lang="less">
    .base-modal {
    }
</style>
