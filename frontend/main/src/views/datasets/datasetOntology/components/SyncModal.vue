<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="t('business.ontology.sync.saveToOntology')"
    destroyOnClose
    centered
  >
    <div class="content">
      <div class="text" v-if="hasOntology">{{ t('business.ontology.sync.selectOntology') }}</div>
      <div class="text" v-else>{{ t('business.ontology.sync.noOntology') }}</div>
      <Form ref="formRef" :model="formState" :rules="rules">
        <Form.Item
          v-if="hasOntology"
          :label="t('business.ontology.ontology')"
          :labelCol="{ span: 5, offset: 3 }"
          :wrapperCol="{ span: 12 }"
        >
          <Select v-model:value="formState.ontologyId" optionFilterProp="label">
            <Select.Option
              v-for="item in ontologyList"
              :key="item.id"
              @select="handleSelectOntology"
            >
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
            @blur="handleBlur"
            @change="handleChange"
            :placeholder="t('business.ontology.createHolder')"
          />
        </Form.Item>
      </Form>
    </div>
    <!-- 重写按钮 -->
    <template #footer>
      <Button @click="handleClose">
        {{ t('common.cancelText') }}
      </Button>
      <Button v-if="hasOntology" type="primary" @click="handleSync" :loading="isLoading">
        {{ t('common.confirmText') }}
      </Button>
      <Button
        class="btn"
        v-else
        type="primary"
        @click="handleSubmit"
        :disabled="!isValid"
        :loading="isLoading"
      >
        {{ t('business.ontology.sync.createAndSync') }}
      </Button>
    </template>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, reactive, watch, computed, inject } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Form, Select, Input, Button } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';

  import { getOntologyByTeamApi } from '/@/api/business/ontology';
  import { ClassTypeEnum } from '/@/api/business/model/ontologyClassesModel';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';

  import { handleMutiTabAction } from '/@/views/ontology/classes/components/modal-components/utils';
  import {
    syncClassToOntologyApi,
    syncClassificationToOntologyApi,
  } from '/@/api/business/datasetOntology';

  import { SaveOntologyParams } from '/@/api/business/model/ontologyModel';
  import { createEditOntologyApi } from '/@/api/business/ontology';
  import { validateCreateName } from '/@/views/ontology/center/components/formSchemas';

  interface IFormState {
    ontologyId: undefined | string | number;
    ontologyName: undefined | string;
  }

  const [registerModal, { closeModal }] = useModalInner(() => {
    getOntologyList();
  });
  const { createMessage } = useMessage();
  const { t } = useI18n();
  const props = defineProps<{
    id: string;
    name: string;
    activeTab: ClassTypeEnum;
    datasetType: datasetTypeEnum;
  }>();

  const formState = reactive<IFormState>({
    ontologyId: undefined,
    ontologyName: undefined,
  });
  // ontology 创建
  const formRef = ref();
  // 校验规则
  const rules = {
    ontologyName: [
      { required: true, validator: validateCreateName, trigger: 'blur' },
      { max: 256, message: t('business.ontology.maxLength') },
    ],
  };
  // 校验
  const isValid = ref<boolean>(false);
  const handleBlur = () => {
    // blur 调整为不改动 isValid
    // formRef.value
    //   .validate()
    //   .then((res) => {
    //     res.ontologyName ? (isValid.value = true) : (isValid.value = false);
    //   })
    //   .catch((error) => {
    //     isValid.value = false;
    //     console.log(error);
    //   });
  };
  // 切换按钮状态
  const handleChange = () => {
    if (!!formState.ontologyName) {
      isValid.value = true;
    } else {
      isValid.value = false;
    }
  };

  // 取消
  const handleClose = () => {
    formState.ontologyId = ontologyList.value?.[0]?.id;
    formState.ontologyName = undefined;
    isValid.value = false;
    closeModal();
  };

  // 是否有 ontology
  const hasOntology = computed<boolean>(() => {
    return ontologyList.value?.length > 0;
  });
  // ontology 下拉框
  const ontologyList = ref();
  // 获取 ontology 下拉框数据
  const getOntologyList = async () => {
    const res = await getOntologyByTeamApi({ type: props.datasetType, name: undefined });
    ontologyList.value = res;
    formState.ontologyId = ontologyList.value?.[0]?.id;
    return res;
  };
  // 下拉框选择事件
  const handleSelectOntology = (e) => {
    formState.ontologyId = e;
  };

  watch(
    () => props.datasetType,
    () => {
      getOntologyList();
    },
    { immediate: true },
  );

  const isLoading = ref<boolean>(false);
  const handleRefresh = inject('handleRefresh', Function, true);
  // 保存同步
  const handleSync = async () => {
    isLoading.value = true;
    const params = {
      id: props.id,
      ontologyId: formState.ontologyId as unknown as string,
    };
    handleMutiTabAction(
      props.activeTab,
      async () => {
        try {
          await syncClassToOntologyApi(params);

          const successText =
            t('business.class.class') + ` "${props.name}" ` + t('business.class.hasSync');
          createMessage.success(successText);

          handleClose();
          // 同步之后需要刷新列表
          handleRefresh();
        } catch (e) {}
      },
      async () => {
        try {
          await syncClassificationToOntologyApi(params);

          const successText =
            t('business.class.classification') + ` "${props.name}" ` + t('business.class.hasSync');
          createMessage.success(successText);

          handleClose();
          // 同步之后需要刷新列表
          handleRefresh();
        } catch (e) {}
      },
    );
    setTimeout(() => {
      isLoading.value = false;
    }, 500);
  };

  // 创建并同步
  const handleSubmit = async () => {
    isLoading.value = true;
    try {
      // 校验
      await formRef.value.validate();

      const postData: SaveOntologyParams = {
        name: formState.ontologyName as unknown as string,
        type: props.datasetType,
      };
      // 创建
      await createEditOntologyApi(postData);

      // 同步
      await toSync();

      setTimeout(() => {
        const successText = t('business.ontology.sync.successCreated');
        createMessage.success(successText);
      }, 1000);
    } catch (error) {}

    setTimeout(() => {
      isLoading.value = false;
    }, 1000);
  };
  const toSync = async () => {
    // 先获取创建的 ontology 下拉列表
    const res = await getOntologyByTeamApi({ type: props.datasetType, name: '' });
    if (res.length <= 0) throw new Error('There is no data');

    // 再根据 ontologyName 找到创建的那个 ontology 的 id
    const ontologyId = res.filter((item) => item.name == formState.ontologyName)[0].id;
    if (!ontologyId) throw new Error('There is no your ontology');

    // 拼接数据
    const params = {
      id: props.id,
      ontologyId: String(ontologyId),
    };

    // 开始同步
    handleMutiTabAction(
      props.activeTab,
      async () => {
        try {
          await syncClassToOntologyApi(params);
        } catch (e) {}
        // 关闭弹窗
        handleClose();
        // 同步之后需要刷新列表
        handleRefresh();
      },
      async () => {
        try {
          await syncClassificationToOntologyApi(params);
        } catch (e) {}
        // 关闭弹窗
        handleClose();
        // 同步之后需要刷新列表
        handleRefresh();
      },
    );
  };
</script>
<style scoped lang="less">
  .content {
    display: flex;
    flex-direction: column;
    text-align: center;
    margin: 0 auto;
    width: 368px;
    padding-top: 50px;

    .text {
      margin: 10px 0;
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
