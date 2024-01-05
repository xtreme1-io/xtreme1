<template>
  <div class="pc-editor-operation">
    <SourceTab />
    <Classification />
    <Results />
    <div v-show="!canOperate()" class="over-not-allowed"></div>
  </div>
</template>

<script setup lang="ts">
  import useUI from '../../hook/useUI';
  import SourceTab from './SourceTab/index.vue';
  import Classification from './Classification/index.vue';
  import Results from './Results/index.vue';

  const { canOperate } = useUI();
</script>

<style lang="less">
  .pc-editor-operation {
    position: relative;
    color: white;
    height: 100%;
    overflow-y: overlay;
    &::-webkit-scrollbar {
      width: 0;
    }
  }
</style>
