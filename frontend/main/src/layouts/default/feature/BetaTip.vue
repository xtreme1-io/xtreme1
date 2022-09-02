<template>
  <div v-if="showBeta == 'show'" class="beta-tip">
    <Icon icon="ic:baseline-info" size="18" color="#FCB17A" class="mr-8px" />
    <span class="mr-20px">
      This is a beta version, you may face data inconsistency in the future version.
    </span>
    <Icon class="cursor-pointer" icon="mdi:close" color="#aaaaaa" size="18" @click="handleClose" />
  </div>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import Icon from '/@/components/Icon/index';

  const showBeta = ref<string>('show');
  showBeta.value = window.sessionStorage.getItem('showBeta') ?? 'show';
  const handleClose = () => {
    console.log('close the beta ');
    showBeta.value = 'hidden';
    window.sessionStorage.setItem('showBeta', 'hidden');
  };
</script>
<style lang="less" scoped>
  .beta-tip {
    position: fixed;
    top: 13px;
    // bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;

    height: 36px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 10px 20px;

    background: #fdf8eb;
    // border: 1px solid #f4ddbb;
    // box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.15);
    border-radius: 50px;

    color: #9f6835;
    // pointer-events: none;
    span {
      white-space: nowrap;
    }
  }
</style>
