<template>
  <div :class="`${prefixCls}`" v-if="showCustomPagination">
    <div class="left">
      <span>{{ 'Show' }}</span>
      <span>
        <Select :value="props.pagination.defaultPageSize" ref="select" @select="handleSelect">
          <template #suffixIcon><CaretDownOutlined /></template>
          <Select.Option
            v-for="(item, index) in props.pagination.pageSizeOptions"
            :key="index"
            :value="item"
          >
            {{ item }}
          </Select.Option>
        </Select>
      </span>
    </div>
    <div class="right">
      <Space :size="10">
        <span
          class="right__btn"
          :class="{
            'cursor-not-allowed': props.pagination.current == 1,
            'cursor-pointer': props.pagination.current != 1,
          }"
          @click="handleFirst"
        >
          {{ 'First' }}
        </span>
        <span
          class="right__btn"
          :class="{
            'cursor-not-allowed': props.pagination.current == 1,
            'cursor-pointer': props.pagination.current > 1,
          }"
          @click="handlePrev"
        >
          {{ 'Prev' }}
        </span>
        <span class="right__btn right__page">
          <span>{{ props.pagination.current }}</span>
          <span>/ {{ totalPageSize }}</span>
        </span>
        <span
          class="right__btn"
          :class="{
            'cursor-not-allowed': props.pagination.current == totalPageSize,
            'cursor-pointer': props.pagination.current < totalPageSize,
          }"
          @click="handleNext"
        >
          {{ 'Next' }}
        </span>
        <span
          class="right__btn"
          :class="{
            'cursor-not-allowed': props.pagination.current == totalPageSize,
            'cursor-pointer': props.pagination.current != totalPageSize,
          }"
          @click="handleLast"
        >
          {{ 'Last' }}
        </span>
      </Space>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import { Select, Space } from 'ant-design-vue';
  import { CaretDownOutlined } from '@ant-design/icons-vue';
  // 工具
  import { useDesign } from '/@/hooks/web/useDesign';
  const { prefixCls } = useDesign('thePagination');

  const props = defineProps<{ pagination: any; setPagination: Function; reload: Function }>();

  // 是否显示 Pagination
  const showCustomPagination = computed(() => {
    return !!props.pagination && props.pagination.total > 10;
  });
  // 总页数
  const totalPageSize = computed(() => {
    return Math.ceil(props.pagination.total / props.pagination.pageSize);
  });

  // 首页
  const handleFirst = () => {
    props.setPagination && props.setPagination({ current: 1 });
    props.reload();
  };
  // 尾页
  const handleLast = () => {
    props.setPagination && props.setPagination({ current: totalPageSize.value });
    props.reload();
  };
  // 上一页
  const handlePrev = () => {
    if (props.pagination.current > 1) {
      props.setPagination && props.setPagination({ current: props.pagination.current - 1 });
      props.reload();
    }
  };
  // 下一页
  const handleNext = () => {
    if (props.pagination.current < totalPageSize.value) {
      props.setPagination && props.setPagination({ current: props.pagination.current + 1 });
      props.reload();
    }
  };
  // 页数改变
  const handleSelect = (value) => {
    props.setPagination && props.setPagination({ current: 1, pageSize: Number(value) });
    props.reload();
  };
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-thePagination';
  .@{prefix-cls} {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    // height: 32px;
    // margin-top: 12px;
    background: #e6f7fd;
    padding-top: 12px;

    font-family: 'Roboto';
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 16px;
    color: #666;

    .left {
      display: flex;
      align-items: center;
      width: 100px;
      height: 32px;
      padding: 4px;
      background: #ffffff;
      border-radius: 8px;
    }

    .right {
      display: flex;
      justify-content: flex-end;

      .right__btn {
        width: 40px;
        height: 32px;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 4px;
        background: #ffffff;
        border-radius: 8px;
        // cursor: pointer;
        user-select: none;
      }

      .right__page {
        width: auto;
        height: 32px;

        & > span {
          color: #999;

          &:first-child {
            width: auto;
            min-width: 24px;
            height: 24px;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #fafafa;
            border-radius: 4px;
            font-weight: 400;
            color: #57ccef;
            margin-right: 6px;
            padding: 4px;
          }
        }
      }
    }

    :deep(.ant-select) {
      width: 50px;
      height: 24px;
      border: none;
      margin-left: 6px;
      border-radius: 4px;

      .ant-select-selector {
        width: 50px;
        height: 24px;
        padding: 0;
        border: none;
        background-color: #fafafa;
        border-radius: 4px;

        .ant-select-selection-item {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 4px;
          color: #aaaaaa;
          padding-right: 15px;
        }
      }

      .ant-select-arrow {
        right: 5px;
      }
    }
  }
</style>
