<template>
  <div :class="`${prefixCls}`">
    <Icon
      @click="handleBack"
      style="cursor: pointer; color: #cccccc"
      icon="ic:outline-arrow-back"
    />
    <span class="breadcrumb">{{ breadcrumb }}</span>
    <img v-show="!props.isDisabled" class="delete" :src="deleteSvg" @click="handleDelete" />
  </div>
</template>
<script lang="ts" setup>
  import { unref, computed } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import Icon from '/@/components/Icon';
  import deleteSvg from '/@/assets/svg/ontology/delete.svg';
  import { getBreadcrumb } from './utils';

  const { prefixCls } = useDesign('formBack');
  const props = defineProps<{
    dataSchema?: any;
    indexList?: number[];
    isDisabled: boolean;
  }>();

  const breadcrumb = computed(() => {
    return getBreadcrumb(unref(props.dataSchema), unref(props.indexList), []);
  });

  const emits = defineEmits(['back', 'del']);
  const handleBack = () => {
    emits('back');
  };
  const handleDelete = () => {
    emits('del');
  };
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-formBack';
  .@{prefix-cls} {
    display: inline-flex;
    align-items: center;
    width: 100%;

    .breadcrumb {
      flex: 1;
      margin: 0 12px;
      font-size: 14px;
      overflow: hidden;
      white-space: break-spaces;
      text-overflow: ellipsis;
      color: #333333;
    }

    .delete {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 14px;
      height: 17px;
      cursor: pointer;
    }
  }
</style>
