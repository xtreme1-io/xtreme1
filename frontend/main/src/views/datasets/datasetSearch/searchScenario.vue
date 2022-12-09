<template>
  <div :class="`${prefixCls}`">
    <div class="content">
      <div class="flex p-25px">
        <div class="mr-24px">
          <Icon icon="material-symbols:arrow-back" />
          Back
        </div>
        <div>
          <Icon icon="material-symbols:info-rounded" color="#57CCEF" />
          This page allows you to search your data in this dataset by search ontologies
        </div>
      </div>
      <div class="flex pl-25px pr-25px">
        <AutoComplete class="flex-1">
          <template #dataSource>
            <Select.Option v-for="email in result" :key="email">
              {{ email }}
            </Select.Option>
          </template>
        </AutoComplete>
        <Button class="ml-20px" type="default">Export Result</Button>
      </div>
      <!-- <div class="list">
        <div class="item">
          <Button type="primary">Annotate</Button>
        </div>
      </div> -->
      <div class="empty">
        <div class="text-center">
          <img class="inline-block mb-4" width="136" :src="datasetEmpty" alt="" />
          <div>Current Scenario is Empty</div>
        </div>
      </div>
    </div>
    <div class="filter">
      <div class="flex justify-between">
        <div>Filter</div>
        <div>
          <SvgIcon name="reload" />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  // import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { AutoComplete, Select } from 'ant-design-vue';
  import { Button } from '/@/components/BasicCustom/Button';
  import Icon, { SvgIcon } from '/@/components/Icon';
  import datasetEmpty from '/@/assets/images/dataset/dataset_empty.png';
  import { ref } from 'vue';
  const { prefixCls } = useDesign('searchScenario');
  // const { t } = useI18n();
  const result = ref();
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-searchScenario';
  .@{prefix-cls} {
    color: #333;
    // background: #f2f5fa;
    display: flex;
    .content {
      flex: 1;
    }
    .list {
      background: white;
      margin-top: 20px;
      margin-left: 25px;
      margin-right: 25px;
      padding: 12px;
      border-radius: 8px;
      .item {
        width: 227px;
        height: 240px;
        background-color: red;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    .empty {
      width: 100%;
      height: calc(100vh - 180px);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .filter {
      width: 220px;
      background: #fff;
      height: calc(100vh - @header-height);
      padding: 10px;
    }
  }
</style>
