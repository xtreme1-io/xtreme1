<template>
  <div :class="`${prefixCls}`">
    <!-- <div :class="`${prefixCls}-empty`" v-if="list.length === 0">
      <p><b>Claim Task</b></p>
      <p><b>Review1</b></p>
    </div> -->
    <div :class="`${prefixCls}-list`" v-if="list.length > 0">
      <TaskCard v-for="item in list" :key="item.id" :data="item" />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import TaskCard from './components/TaskCard.vue';
  // import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { onBeforeMount, ref } from 'vue';
  import { claimListItem, ClaimListGetResultModel } from '/@/api/business/model/claimModel';
  import { claimListApi } from '/@/api/business/claim';
  // const { t } = useI18n();
  const { prefixCls } = useDesign('claimList');

  const list = ref<claimListItem[]>([]);
  const fetchList = async () => {
    const res: ClaimListGetResultModel = await claimListApi({
      page: 1,
      pageSize: 10,
    });

    list.value = res.list;
  };
  onBeforeMount(() => {
    fetchList();
  });
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-claimList';
  .@{prefix-cls} {
    &-list {
      flex: 1;
      padding: 0 10px;
      margin: 20px 10px;
    }

    &-empty {
      // justify-content: center;
      // align-items: center;
      text-align: center;
      margin-top: 17%;

      p {
        font-size: large;
      }
    }
  }
</style>
