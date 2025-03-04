<template>
  <IconViewComments />
  <div class="header-content">
    <span>{{ props.title }}</span>
    <div class="tool">
      <a-popover
        placement="bottomRight"
        v-model:visible="filterVisible"
        :trigger="['click']"
        :destroyTooltipOnHide="true"
      >
        <template #content>
          <Filter
            ref="filterRef"
            v-model:hasFilter="hasFilter"
            :loading="isLoading"
            :stageTree="stageTree"
            @apply="handleApply"
            @reset="handleReset"
          />
        </template>
        <FilterFilled :class="{ 'filter-active': hasFilter }" />
      </a-popover>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { FilterFilled } from '@ant-design/icons-vue';
  import { t } from '@/lang';
  import Filter from './Filter.vue';
  import * as api from '@/business/chengduNew/api';
  import { useInjectBSEditor } from '../../../context';
  import Event from '../../../config/event';

  const editor = useInjectBSEditor();
  const { bsState } = editor;

  const props = defineProps<{ title: string }>();

  // filter --------------------------
  // 用于控制 popover 的显隐
  const filterVisible = ref<boolean>(false);
  const hasFilter = ref<boolean>(false);
  const isLoading = ref<boolean>(false);
  watch(filterVisible, async (newVal) => {
    if (newVal && stageTree.value.length == 0) {
      isLoading.value = true;
      await getItemFlow();
      isLoading.value = false;
    }
  });
  // 重置
  const handleReset = () => {
    filterVisible.value = false;
    hasFilter.value = false;
    editor.emit(Event.UPDATE_COMMENTS);
  };
  // 确认
  const handleApply = () => {
    filterVisible.value = false;
    editor.emit(Event.UPDATE_COMMENTS);
  };

  // Stage 数据
  const stageTree = ref<any>([]);
  const getItemFlow = async () => {
    const frame = editor.getCurrentFrame();
    const params = {
      taskId: bsState.task?.id as string,
      itemId: frame.id,
    };
    const res = await api.getItemFlow(params);
    const children = res
      .filter((item: any) => item.stageName != 'Annotate')
      .map((item: any) => {
        return { title: item.stageName, key: item.stageName };
      });
    const obj = {
      title: t('image.Select all'),
      key: 'All',
      children,
    };
    stageTree.value = [obj];
  };
</script>

<style lang="less" scoped>
  .header-content {
    flex: 1;
    display: flex;
    justify-content: space-between;
  }

  .filter-active {
    color: @primary-color;
  }
</style>
