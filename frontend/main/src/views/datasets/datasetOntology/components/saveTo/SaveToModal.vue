<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="t('business.ontology.sync.saveToOntology')"
    destroyOnClose
    centered
    @cancel="handleCancel"
    :minHeight="70"
  >
    <div class="saveTo__content">
      <!-- <div class="text" v-if="hasOntology">{{ t('business.ontology.sync.selectOntology') }}</div> -->
      <div class="text" v-if="!hasOntology">{{ t('business.ontology.sync.noOntology') }}</div>
      <div class="content__form">
        <Form ref="formRef" labelAlign="left" :model="formState" :rules="rules">
          <Form.Item
            v-if="hasOntology"
            label="Select an ontology to save into"
            :labelCol="{ span: 9 }"
          >
            <Select
              v-model:value="formState.ontologyId"
              optionFilterProp="label"
              @select="handleSelectOntology"
            >
              <Select.Option v-for="item in ontologyList" :key="item.id">
                {{ item.name }}
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            v-else
            :label="t('business.ontology.ontologyName')"
            :labelCol="{ span: 9, offset: 0 }"
            :wrapperCol="{ span: 12 }"
            name="ontologyName"
          >
            <Input
              autocomplete="off"
              v-model:value="formState.ontologyName"
              type="input"
              allow-clear
              @change="handleChange"
              :placeholder="t('business.ontology.createHolder')"
            />
          </Form.Item>
        </Form>
      </div>
      <!-- Conflict -->
      <div v-show="conflictList.length > 0" class="content__table">
        <div class="header">
          <div class="icon">
            <Icon icon="fluent:info-16-filled" color="#FCB17A" class="mr-10px" size="24px" />
            <span> {{ 'Conflicts' }} </span>
          </div>
          <span>
            Some Classes/ Classifications have already existed in your ontology. To resolve these
            conflicts, please choose to
            <span class="weight">Keep</span>
            Original or to
            <span class="weight">Replace</span>
            Original with New Classes/ Classifications.
          </span>
        </div>
        <div class="title">Classes</div>
        <div class="action">
          <span class="highLight" @click="handleToggleKeepAll(ICopySelectEnum.REPLACE)">
            Replace All
          </span>
          <span class="highLight" @click="handleToggleKeepAll(ICopySelectEnum.KEEP)">
            Keep All
          </span>
        </div>
        <CustomTable ref="tableRef" class="table" :type="props.activeTab" :list="conflictList" />
      </div>
    </div>
    <!-- 重写按钮 -->
    <template #footer>
      <Button @click="handleCancel">
        {{ t('common.cancelText') }}
      </Button>
      <Button
        v-if="hasOntology"
        type="primary"
        @click="handleSaveTo"
        :disabled="!isConfirmDisabled"
        :loading="isLoading"
      >
        {{ t('common.confirmText') }}
      </Button>
      <Button
        class="btn"
        v-else
        type="primary"
        @click="handleCreateAndSaveTo"
        :disabled="!isValid"
        :loading="isLoading"
      >
        {{ t('business.ontology.sync.createAndSync') }}
      </Button>
    </template>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, reactive, computed, inject, watch } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Form, Select, Input } from 'ant-design-vue';
  import { Button } from '/@@/Button';
  import { Icon } from '/@/components/Icon';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import CustomTable from '../copy-modal/CustomTable.vue';
  // import SaveToConflictModal from './SaveToConflictModal.vue';

  import { getAllOntologyApi } from '/@/api/business/ontology';
  import { ClassTypeEnum, getOntologyClassesParams } from '/@/api/business/model/classesModel';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';

  import {
    saveClassToOntologyApi,
    saveClassificationToOntologyApi,
    getOntologyClassApi,
    getOntologyClassificationApi,
  } from '/@/api/business/classes';

  import { SaveOntologyParams } from '/@/api/business/model/ontologyModel';
  import { createOntologyApi } from '/@/api/business/ontology';
  import { validateCreateName } from '/@/views/ontology/center/components/formSchemas';
  import { ICopySelectEnum, IFormState } from '../copy-modal/data';
  import { validateClassConflict, validateClassificationConflict } from '../utils';

  const { createMessage } = useMessage();
  const { t } = useI18n();
  const props = defineProps<{
    activeTab: ClassTypeEnum;
    datasetType: datasetTypeEnum;
    datasetId: string | number;
    selectedList: any[];
  }>();
  const handleRefresh = inject('handleRefresh', Function, true);

  /** Modal */
  const [registerModal, { closeModal, changeLoading }] = useModalInner(() => {
    getOntologyList();
  });
  const handleCancel = () => {
    console.log('cancel');

    formState.ontologyId = undefined;
    formState.ontologyName = undefined;
    isValid.value = false;
    conflictList.value = [];
    noConflictList.value = [];
    closeModal();
  };

  /** Form */
  const formRef = ref();
  const formState = reactive<IFormState>({
    ontologyId: undefined,
    ontologyName: undefined,
  });
  const rules = {
    ontologyName: [
      { required: true, validator: validateCreateName, trigger: 'change' },
      { max: 256, message: t('business.ontology.maxLength') },
    ],
  };
  // 校验
  const isValid = ref<boolean>(false);
  // 切换按钮状态
  const handleChange = () => {
    if (!!formState.ontologyName) {
      isValid.value = true;
    } else {
      isValid.value = false;
    }
  };

  /** Ontology List */
  const ontologyList = ref();
  const hasOntology = computed<boolean>(() => {
    return ontologyList.value?.length > 0;
  });
  const getOntologyList = async () => {
    const res = await getAllOntologyApi({ type: props.datasetType });
    ontologyList.value = [...res];
    // formState.ontologyId = ontologyList.value?.[0]?.id;
    return res;
  };
  const handleSelectOntology = (e) => {
    formState.ontologyId = e;
    handleToConflict(e);
    isConfirmDisabled.value = false;
  };

  const isConfirmDisabled = ref<boolean>(false);
  const isLoading = ref<boolean>(false);
  /** Conflict */
  const handleToggleKeepAll = (isKeep: ICopySelectEnum) => {
    conflictList.value.forEach((item) => (item.isKeep = isKeep));
  };
  const conflictList = ref<any[]>([]);
  const noConflictList = ref<any[]>([]);
  watch(
    conflictList,
    () => {
      isConfirmDisabled.value = conflictList.value.every(
        (item) => item.isKeep != ICopySelectEnum.NONE,
      );
    },
    { deep: true },
  );
  const handleToConflict = async (ontologyId) => {
    if (!ontologyId) return;
    changeLoading(true);
    isConfirmDisabled.value = true;

    const postData: getOntologyClassesParams = {
      pageNo: 1,
      pageSize: 100,
      ontologyId: Number(ontologyId),
    };

    let res: any = [];
    if (props.activeTab == ClassTypeEnum.CLASS) {
      const { list: classList } = await getOntologyClassApi(postData);
      res = validateClassConflict(props.selectedList, classList);
    } else {
      const { list: classificationList } = await getOntologyClassificationApi(postData);
      res = validateClassificationConflict(props.selectedList, classificationList);
    }

    setTimeout(() => {
      noConflictList.value = [...res.noConflictList];
      conflictList.value = [...res.conflictList];
      if (conflictList.value.length > 0) {
        conflictList.value = conflictList.value.map((item) => {
          item.isKeep = ICopySelectEnum.NONE;
          return item;
        });
      }
      changeLoading(false);
      isConfirmDisabled.value = false;
    }, 500);
  };

  /** SaveTo */
  const handleSaveTo = async () => {
    if (formState.ontologyId) {
      const ontologyId = formState.ontologyId as number;

      const replaceList = conflictList.value.filter(
        (item) => item.isKeep == ICopySelectEnum.REPLACE,
      );
      const list: any = [...replaceList, ...noConflictList.value];

      await handleConfirm(ontologyId, list);
      setTimeout(() => {
        const successText = t('business.ontology.sync.successCreated');
        createMessage.success(successText);
      }, 1000);
    }
  };

  /** Create & SaveTo */
  const handleCreateAndSaveTo = async () => {
    isLoading.value = true;
    try {
      await formRef.value.validate();

      const postData: SaveOntologyParams = {
        name: formState.ontologyName as unknown as string,
        type: props.datasetType,
      };
      const res: any = await createOntologyApi(postData);

      await handleConfirm(res.id, props.selectedList);

      setTimeout(() => {
        const successText = t('business.ontology.sync.successCreated');
        createMessage.success(successText);
      }, 1000);
    } catch (error) {}

    setTimeout(() => {
      isLoading.value = false;
    }, 1000);
  };

  /** Confirm */
  const handleConfirm = async (ontologyId: number, list: any[] = []) => {
    isLoading.value = true;
    try {
      if (props.activeTab == ClassTypeEnum.CLASS) {
        const params = {
          datasetId: props.datasetId,
          ontologyId: ontologyId,
          classIds: list.map((item) => item.id),
        };
        list.length > 0 && (await saveClassToOntologyApi(params));
      } else {
        const params = {
          datasetId: props.datasetId,
          ontologyId: ontologyId,
          classificationIds: list.map((item) => item.id),
        };
        list.length > 0 && (await saveClassificationToOntologyApi(params));
      }
      handleCancel();
      handleRefresh();
    } catch (error: any) {
      createMessage.error(String(error));
    }

    isLoading.value = false;
  };
</script>
<style scoped lang="less">
  .saveTo__content {
    width: 100%;
    display: flex;
    flex-direction: column;
    // text-align: center;
    margin: 0 auto;
    padding: 26px 26px 0;
    .content__table {
      height: 100%;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
      .header {
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
        color: #666666;
        margin-bottom: 14px;
        .icon {
          display: flex;
          align-items: center;
          color: #333;
          font-size: 16px;
          font-weight: 500;
        }
      }
      .title {
        font-weight: 500;
        font-size: 16px;
        line-height: 24px;
        color: #333;
      }
      .action {
        display: flex;
        gap: 20px;
        height: 16px;
        font-weight: 400;
        font-size: 14px;
        line-height: 16px;
        color: @primary-color;
        cursor: pointer;
      }
      .table {
        flex: 1;
        height: 100%;
      }
    }
  }

  :deep(.ant-select) {
    width: 160px;
  }

  .btn {
    width: auto !important;
    min-width: 90px;
  }
</style>
