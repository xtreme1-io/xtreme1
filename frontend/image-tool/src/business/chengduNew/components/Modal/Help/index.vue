<template>
  <Tabs v-model:activeKey="activeKey">
    <TabPane key="hotkey" :tab="t('image.titleHotKeys')">
      <Hotkey />
    </TabPane>
    <TabPane v-if="bsState.isTaskFlow" key="instruction" :tab="t('image.Instruction')">
      <Instruction />
    </TabPane>
  </Tabs>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { Tabs, TabPane } from 'ant-design-vue';
  import { useInjectBSEditor } from '../../../context';
  import { t } from '@/lang';

  import Hotkey from './Hotkey.vue';
  import Instruction from './Instruction.vue';

  const editor = useInjectBSEditor();
  const { bsState } = editor;
  const activeKey = ref<string>('hotkey');
</script>
