<template>
  <div class="pc-loading" v-show="state.visible">
    <div v-show="state.type === 'loading'">
      <LoadingOutlined /><span>{{ state.content }}</span>
    </div>
    <div v-show="state.type === 'error'">Load error, click<span class="retry">retry</span></div>
  </div>
</template>

<script setup lang="ts">
  import { reactive } from 'vue';
  import { useInjectEditor } from '../../context';
  import { StatusType } from '../../../image-editor';
  import { LoadingOutlined } from '@ant-design/icons-vue';

  // ***************Props and Emits***************
  // const emit = defineEmits(['close']);
  // let props = defineProps(['data']);
  // *********************************************

  type IType = 'loading' | 'error';

  const editor = useInjectEditor();
  const state = reactive({
    visible: false,
    content: 'loading......',
    type: 'error' as IType,
  });

  editor.showLoading = (config) => {
    if (config === true) {
      editor.state.status = StatusType.Loading;
      state.visible = true;
      state.content = '';
      state.type = 'loading';
    } else if (config === false) {
      state.visible = false;
      editor.state.status = StatusType.Default;
    } else {
      editor.state.status = StatusType.Loading;
      state.visible = true;
      state.content = config.content;
      state.type = config.type;
    }
  };
</script>

<style lang="less">
  .pc-loading {
    display: flex;
    position: absolute;
    z-index: 1000;
    justify-content: center;
    align-items: center;
    background: rgb(51 51 51 / 90%);
    font-size: 12px;
    color: #a2a2a2;
    inset: 0;

    .anticon {
      margin-right: 10px;
      font-size: 30px;
      color: #60a9fe;
    }

    .retry {
      text-decoration: underline;
      color: #60a9fe;
      cursor: pointer;
    }
  }
</style>
