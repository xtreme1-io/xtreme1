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
    position: absolute;
    color: white;
    inset: 0;
    overflow-y: overlay;
    display: flex;
    flex-direction: column;

    &::-webkit-scrollbar {
      width: 0;
    }
  }
</style>
