<template>
  <ActionSelect
    :selectedList="selectedItemIds"
    :actionList="actionList"
    :functionMap="functionMap"
  />
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  // import { useI18n } from '/@/hooks/web/useI18n';
  // import { useMessage } from '/@/hooks/web/useMessage';

  import { ActionSelect } from '/@/components/BasicCustom/ActionSelect';
  import { actionList } from './actionList';

  // const { t } = useI18n();
  // const { createMessage } = useMessage();

  const props = defineProps<{
    selectedList: string[];
    list: any[];
  }>();
  const emits = defineEmits(['selectAll', 'unSelect', 'refresh']);

  const selectedItemIds = computed(() => {
    return props.list
      .filter((item) => props.selectedList.includes(item.id))
      .map((item) => item.itemId);
  });

  // Select
  const handleSelectAll = () => {
    emits('selectAll');
  };
  const handleUnselectAll = () => {
    emits('unSelect');
  };

  const functionMap = {
    handleSelectAll,
    handleUnselectAll,
  };
</script>
