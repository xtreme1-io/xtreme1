<template>
  <div class="runs">
    <!-- 按钮 -->
    <div class="runs__btn">
      <div class="refresh-btn" @click="handleRefreshTable">
        <Icon icon="charm:refresh" size="18" style="color: #aaa; transform: rotate(-70deg)" />
      </div>
      <!-- <Authority :value="[PermissionCodeEnum.MODEL_RUN]"> -->
      <Button gradient @click="handleOpenRunModel" style="border-radius: 8px" noBorder>
        {{ t('business.models.run.runModel') }}
      </Button>
      <!-- </Authority> -->
    </div>
    <!-- 表格 -->
    <div class="table-wrapper flex-1">
      <BasicTable @register="registerTable" />
    </div>
    <ModelRun
      @register="registerRunModel"
      :selectName="selectName"
      :title="title"
      :modelId="props.modelId"
      @run="handleRun"
    >
      <template #select>
        <Select v-model:value="selectId" optionFilterProp="label">
          <Select.Option v-for="item in selectOptions" :key="item.id" @select="handleSelect">
            {{ item.name }}
          </Select.Option>
        </Select>
      </template>
    </ModelRun>
    <RunsDeleteModal @register="registerDeleteModel" :id="deleteId" @delete="reload" />
  </div>
</template>
<script lang="ts" setup>
  import { onBeforeMount, ref, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { RouteEnum } from '/@/enums/routeEnum';
  import { useGo } from '/@/hooks/web/usePage';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { parseParam } from '/@/utils/business/parseParams';
  // 组件
  import { Select } from 'ant-design-vue';
  import { Button } from '/@@/Button';
  import { ModelRun } from '/@@/ModelRun';
  import { useModal } from '/@/components/Modal';
  import Icon from '/@/components/Icon/index';
  // import { ApiSelect } from '/@/components/Form/index';
  import { BasicTable, useTable } from '/@/components/Table';
  import RunsDeleteModal from './RunsDeleteModal.vue';
  import { getBasicColumns, getActionColumn } from './tableData';
  // 接口
  import {
    getModelRunApi,
    createModelRunApi,
    rerunModelRunApi,
    getAllDataset,
    getAllModelRunRecordApi,
  } from '/@/api/business/models';
  import {
    PreModelParam,
    runModelRunParams,
    ModelRunItem,
  } from '/@/api/business/model/modelsModel';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';
  // import { Authority } from '/@/components/Authority';
  // import { PermissionCodeEnum } from '/@/enums/permissionCodeEnum';

  const { t } = useI18n();
  const go = useGo();
  const { createMessage } = useMessage();

  const props = defineProps<{
    modelId: string;
    datasetType: datasetTypeEnum;
    isLimit: boolean;
  }>();
  const emits = defineEmits(['reload']);

  // Table ==>
  const [registerTable, { reload }] = useTable({
    afterFetch: (res) => {
      // debugger;
      return [{}];
    },
    bordered: true,
    api: () => {},
    columns: getBasicColumns(),
    searchInfo: { modelId: Number(props.modelId) },
    showIndexColumn: false,
    pagination: true,
    actionColumn: getActionColumn({
      view: handleView,
      delete: handleDelete,
      rerun: handleRerun,
    }),
  });

  // 刷新表格
  const handleRefreshTable = () => {
    reload();
    emits('reload');
  };

  // ModelRun
  const selectName = t('business.models.runModel.dataset');
  const title = t('business.models.run.runModel');
  const [
    registerRunModel,
    { openModal: openRunModal, closeModal: closeRunModal, setModalProps: setRunModalProps },
  ] = useModal();
  // 打开 ModelRun 弹窗
  const handleOpenRunModel = () => {
    openRunModal(true, {});
  };
  // 执行 RunModel
  const handleRun = async (params: Nullable<PreModelParam>) => {
    if (props.isLimit) {
      createMessage.error(
        'model runs has reached maximum limit, please contact us for more model usage',
      );
      setRunModalProps({ confirmLoading: false });
      return;
    }

    try {
      const modelId = Number(props.modelId);
      const datasetId = Number(selectId.value);

      const runParams: runModelRunParams = {
        modelId: modelId,
        datasetId: datasetId,
        resultFilterParam: params,
      };
      console.log(runParams);
      // return;
      if (!datasetId) {
        createMessage.error(t('business.models.runModel.selectDataset'));
        return;
      }
      await createModelRunApi(runParams);

      setTimeout(() => {
        closeRunModal();
        setRunModalProps({ confirmLoading: false });
        reload();
      }, 800);
    } catch (error: unknown) {
      console.log(error);

      console.log(String(error));
      createMessage.error(String(error));
      setTimeout(() => {
        setRunModalProps({ confirmLoading: false });
      }, 800);
    }
  };

  // 下拉框 ===>
  onBeforeMount(() => {
    getSelectOptions();
  });
  // 调整为监听到 datasetType 变化
  watch(
    () => props.datasetType,
    () => {
      getSelectOptions();
    },
  );
  const selectId = ref<string | number>('');
  const selectOptions = ref();
  // 获取下拉框数据
  const getSelectOptions = async () => {
    let datasetType = [datasetTypeEnum.IMAGE];
    if (props.datasetType != datasetTypeEnum.IMAGE) {
      datasetType = [datasetTypeEnum.LIDAR_BASIC, datasetTypeEnum.LIDAR_FUSION];
    }
    const res = await getAllDataset({ datasetTypes: datasetType.toString() });
    console.log('model select', res, props.datasetType);

    selectOptions.value = res;
    selectId.value = selectOptions.value?.[0]?.id;
  };
  // 下拉框选择事件
  const handleSelect = (e) => {
    selectId.value = e;
  };

  // rerun 事件
  async function handleRerun(record: ModelRunItem) {
    if (props.isLimit) {
      createMessage.error(
        'model runs has reached maximum limit, please contact us for more model usage',
      );
      return;
    }
    await rerunModelRunApi({ id: record.id });
    setTimeout(() => {
      reload();
    });
  }

  // view 事件
  function handleView(record: ModelRunItem) {
    const url = `${RouteEnum.DATASETS}/data`;
    const params = { id: record.datasetId };
    go(parseParam(url, params));
  }

  // delete 事件
  const [registerDeleteModel, { openModal: openRunsDeleteModal }] = useModal();
  const deleteId = ref('');
  function handleDelete(record: ModelRunItem) {
    deleteId.value = String(record.id);
    openRunsDeleteModal();
  }
</script>
<style lang="less" scoped>
  .runs {
    position: relative;
    display: flex;
    flex-direction: column;
    // height: 100%;

    &__btn {
      position: absolute;
      top: -65px;
      right: 0px;
      display: flex;
      gap: 10px;
      height: 36px;
      margin-bottom: 20px;
      flex-direction: row-reverse;

      button {
        height: 36px;
      }

      .refresh-btn {
        width: 44px;
        height: 36px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 8px;
        background-color: #fff;
        border: 4px solid #f3f3f3;
        cursor: pointer;
      }
    }
  }

  .table__status {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  :deep(.ant-progress) {
    .ant-progress-text {
      color: #333;
    }
  }

  :deep(.ant-table) {
    .ant-table-column-title {
      span {
        font-weight: 700 !important;
        color: #666666;
      }
    }
  }
</style>
