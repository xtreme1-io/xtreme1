<template>
  <div :class="`${prefixCls}`">
    <div
      class="mr-2 leading-7 text-center bg-white rounded cursor-pointer h-28px w-36px"
      @click="
        () => {
          openModal();
        }
      "
    >
      <Icon icon="ri:lock-unlock-fill" color="#AAAAAA" />
    </div>
    <BasicModal
      wrapClassName="unlock__modal"
      :width="500"
      @register="registerModal"
      :title="t('business.datasetContent.unLock.forceUnlock')"
      @ok="handleOk"
      @visible-change="handleVisibleChange"
    >
      <div class="p-4">
        {{ t('business.datasetContent.unLock.tips') }}
      </div>
      <div class="pl-4 pr-4">
        {{ t('business.datasetContent.unLock.totalSelect') }} ：
        {{
          selectData
            .map((item) => item.lockedNum)
            .reduce((curr, prev) => {
              return curr + prev;
            }, 0)
        }}
      </div>
      <div class="p-3">
        <Input
          :placeholder="t('business.datasetContent.unLock.searchPlaceholder')"
          v-model:value="name"
        />
      </div>
      <div class="unlock_table">
        <BasicTable @register="registerTable" />
      </div>
    </BasicModal>
  </div>
</template>
<script lang="ts" setup>
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import Icon from '/@/components/Icon';
  import { BasicModal, useModal } from '/@/components/Modal';
  import { BasicTable, useTable } from '/@/components/Table';
  import { Input, message } from 'ant-design-vue';
  import { getLockedRecordByDataset, unLockApi } from '/@/api/business/dataset';
  import { useRoute } from 'vue-router';
  import { onMounted, ref, watch } from 'vue';

  const { t } = useI18n();
  const [registerModal, { openModal, closeModal }] = useModal();
  const { prefixCls } = useDesign('Template');
  const { query } = useRoute();
  const { id } = query;
  const dataList = ref([]);
  const filterDataList = ref([]);
  const name = ref('');
  const selectData = ref<any>([]);
  const emits = defineEmits(['fetchList']);
  const filterData = () => {
    if (name.value) {
      filterDataList.value = dataList.value.filter((item: any) =>
        item.lockedBy.includes(name.value),
      );
      setTableData(filterDataList.value);
    } else {
      filterDataList.value = dataList.value;
    }
  };

  const getBasicColumns = [
    {
      title: 'Occupied by',
      dataIndex: 'lockedBy',
    },
    {
      title: 'Occupied Data Count',
      dataIndex: 'lockedNum',
    },
  ];

  onMounted(() => {});

  const fetchList = async () => {
    dataList.value = await getLockedRecordByDataset({ datasetId: id });
    filterDataList.value = dataList.value;
  };
  const [registerTable, { setTableData, getSelectRowKeys: getRow }] = useTable({
    // api: getLockedRecordByDataset,
    dataSource: filterDataList,
    columns: getBasicColumns,
    // beforeFetch: () => {
    //   return { datasetId: id };
    // },
    showIndexColumn: false,
    rowKey: 'recordId',
    rowSelection: {
      type: 'checkbox',
      onChange: (_e, data) => {
        selectData.value = data;
      },
    },
  });

  const handleVisibleChange = (flag) => {
    if (flag) {
      fetchList();
    } else {
      name.value = '';
      selectData.value = [];
    }
  };

  watch(name, () => {
    filterData();
  });

  const handleOk = async () => {
    if (getRow().length === 0) {
      return message.error('please select a record');
    }
    await unLockApi({
      lockRecordIds: getRow(),
    });
    closeModal();
    emits('fetchList');
  };
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-unlock';
  .@{prefix-cls} {
    color: #333;
  }
</style>

<style lang="less">
  .unlock__modal {
    .scrollbar__view > div {
      overflow: auto;
      .unlock_table {
        max-height: 300px;
        overflow: auto;
      }
    }
    .scrollbar__wrap {
      // overflow: auto;
    }

    .scrollbar__bar {
      display: none;
    }

    .ant-modal-body {
      // height: 150px;
      // overflow: auto;
    }
  }
</style>
