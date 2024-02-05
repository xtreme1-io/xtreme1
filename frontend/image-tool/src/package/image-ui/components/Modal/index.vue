<template>
  <a-modal
    wrapClassName="base-modal"
    v-model:visible="state.visible"
    :title="state.title"
    :footer="false"
    :destroyOnClose="true"
    v-bind="state.option"
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
  import { StatusType } from '../../../image-editor';
  import { useInjectEditor } from '../../context';
  import injectConfirm from './Confirm';
  import injectMessage from './Message';
  import { isBoolean } from 'lodash';

  const modals: Record<string, Component> = {};
  // ***************Props and Emits***************
  // const emit = defineEmits(['close']);
  // let props = defineProps(['data']);
  // *********************************************

  interface IChild {
    valid: () => Promise<boolean>;
    getData: () => any;
  }

  const editor = useInjectEditor();
  let okCallBack: any = undefined;
  let cancelCallBack: any = undefined;
  // let modalData: any = undefined;
  const child = ref<IChild>({} as IChild);
  const state = reactive({
    visible: false,
    title: '',
    modalName: '',
    modalData: undefined as any,
    banOther: false,
    option: {
      width: 520,
      closable: true,
      mask: true,
      maskClosable: true,
      zIndex: 1000,
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
    state.banOther = false;
  }

  function show() {
    state.visible = true;
  }
  editor.registerModal = (name: string, modal: Component) => {
    modals[name] = modal;
  };

  editor.showModal = (name: any, option = { title: '' }) => {
    if (state.banOther) return Promise.reject();
    if (name === false) {
      state.visible = false;
      return Promise.resolve();
    }

    const modal = modals[name];

    editor.state.status = StatusType.Modal;
    return new Promise((resolve, reject) => {
      if (!modal) return reject({ msg: ` modal ${name} not exist` });

      state.banOther = option.banOther;
      state.modalData = option.data;
      state.modalName = name;
      state.title = option.title;
      state.option.width = option.width || 520;
      state.option.closable = isBoolean(option.closable) ? option.closable : true;
      state.option.mask = isBoolean(option.mask) ? option.mask : true;
      state.option.maskClosable = isBoolean(option.maskClosable) ? option.maskClosable : true;
      state.option.zIndex = option.zIndex ?? 1000;

      show();
      okCallBack = async () => {
        let data = undefined;
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
