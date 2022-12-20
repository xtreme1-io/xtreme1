<template>
  <div v-if="showTable" class="table-wrapper">
    <BasicTable @register="registerTable">
      <template #name="{ record }">
        <div class="flex items-center justify-center gap-10px">
          <div v-if="record.toolType" class="flex items-center justify-center w-24px h-24px">
            <img class="w-16px h-16px" :src="toolTypeImg[record.toolType]" />
          </div>
          <span class="action active">{{ record.name }}</span>
        </div>
      </template>
      <template #action="{ record }">
        <div class="flex items-center justify-center gap-20px">
          <span
            class="action"
            :class="record.isKeep == ICopySelectEnum.REPLACE ? 'active' : ''"
            @click="handleReplace(record)"
          >
            Replace
          </span>
          <span
            class="action"
            :class="record.isKeep == ICopySelectEnum.KEEP ? 'active' : ''"
            @click="handleKeep(record)"
          >
            Keep
          </span>
        </div>
      </template>
    </BasicTable>
  </div>
  <div v-else class="table-wrapper">
    <div class="empty-wrapper">
      <img src="../../../../../assets/svg/empty.svg" alt="" />
      <div class="tip"> No conflict </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed, nextTick, watch } from 'vue';
  import { BasicTable, useTable } from '/@/components/Table';
  import { ClassTypeEnum } from '/@/api/business/model/classModel';
  import { ICopySelectEnum } from './data';
  import { toolTypeImg } from '/@/views/ontology/classes/attributes/data';

  const props = withDefaults(
    defineProps<{
      list: any[];
      type: ClassTypeEnum;
    }>(),
    {
      list: () => [],
    },
  );

  const showTable = computed(() => {
    return props.list.length > 0;
  });

  watch(
    () => props.list,
    (newValue) => {
      nextTick(() => {
        setTableData(newValue);
      });
    },
  );

  const [registerTable, { setTableData }] = useTable({
    dataSource: props.list,
    rowKey: 'id',
    columns: [
      {
        title: props.type == ClassTypeEnum.CLASS ? 'Class Name' : 'Classifications Name',
        dataIndex: 'name',
        width: '50%',
        slots: { customRender: 'name' },
      },
    ],
    showIndexColumn: false,
    pagination: false,
    canResize: false,
    actionColumn: {
      width: '50%',
      title: 'Resolution',
      dataIndex: 'action',
      slots: { customRender: 'action' },
    },
  });

  const handleReplace = (record) => {
    record.isKeep = ICopySelectEnum.REPLACE;
  };
  const handleKeep = (record) => {
    record.isKeep = ICopySelectEnum.KEEP;
  };
</script>
<style lang="less" scoped>
  .action {
    font-weight: 400;
    font-size: 14px;
    line-height: 16px;
    display: flex;
    align-items: center;
    color: #666666;
    cursor: pointer;
    &.active {
      color: @primary-color;
    }
  }
  .table-wrapper {
    height: 100%;
  }

  .empty-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    .tip {
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      color: #666666;
    }
  }
</style>
