<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="t('business.ontology.sync.saveToOntology')"
    destroyOnClose
    centered
    @cancel="handleCancel"
  >
    <div class="content">
      <!-- <div class="text" v-if="hasOntology">{{ t('business.ontology.sync.selectOntology') }}</div> -->
      <div class="text" v-if="!hasOntology">{{ t('business.ontology.sync.noOntology') }}</div>
      <div class="content__form">
        <Form ref="formRef" :model="formState" :rules="rules">
          <Form.Item
            v-if="hasOntology"
            :label="t('business.ontology.ontology')"
            :labelCol="{ span: 5, offset: 3 }"
            :wrapperCol="{ span: 12 }"
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
        :disabled="!isDisabled"
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
  import { ref, reactive, computed, inject } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Form, Select, Input } from 'ant-design-vue';
  import { Button } from '/@@/Button';
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
  };

  const isLoading = ref<boolean>(false);
  const hasResolved = computed(() => {
    return conflictList.value.every((item) => item.isKeep != ICopySelectEnum.NONE);
  });
  const isDisabled = computed(() => {
    return formState.ontologyId && hasResolved.value && !isLoading.value;
  });

  /** Conflict */
  const conflictList = ref<any[]>([]);
  const noConflictList = ref<any[]>([]);
  const handleToConflict = async (ontologyId) => {
    console.log('handleToConflict', ontologyId);
    if (!ontologyId) return;
    changeLoading(true);
    isLoading.value = true;

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
      isLoading.value = false;
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
  .content {
    width: 100%;
    display: flex;
    flex-direction: column;
    text-align: center;
    margin: 0 auto;
    padding: 10px 26px;
    &__table {
      display: flex;
      .table {
        flex: 1;
        height: 100%;
      }
    }
  }

  :deep(.ant-select-dropdown) {
    top: 36px !important;
  }

  :deep(.ant-select-selection-item) {
    text-align: left;
  }

  .btn {
    width: auto !important;
    min-width: 90px;
  }
</style>
