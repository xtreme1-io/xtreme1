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

  const props = defineProps<{ selectedList: any[] }>();
  const emits = defineEmits(['selectAll', 'unSelect', 'refresh', 'delete']);

  const selectedItemIds = computed(() => {
    return props.selectedList.map((item) => item.id);
  });

  // Select
  const handleSelectAll = () => {
    emits('selectAll');
  };
  const handleUnselectAll = () => {
    emits('unSelect');
  };
  const handleDeleted = () => {
    emits('delete');
  };

  const functionMap = {
    handleSelectAll,
    handleUnselectAll,
    handleDeleted,
  };
</script>
