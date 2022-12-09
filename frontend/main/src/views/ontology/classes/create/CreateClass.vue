<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="modalTitle"
    :width="640"
    destroyOnClose
    @cancel="handleCancel"
    @ok="handleCreateSave"
    :okText="okText"
  >
    <div class="create_content class_create">
      <div class="content-item">
        <div class="title">Basic Info</div>
        <div class="content">
          <Form ref="formRef" :model="formState" :rules="rules" hideRequiredMark labelAlign="left">
            <div class="form-wrapper">
              <div class="form-wrapper-left">
                <Form.Item :label="t('common.nameText')" name="name" :colon="false">
                  <Input
                    autocomplete="off"
                    v-model:value="formState.name"
                    :placeholder="t('business.ontology.createHolder')"
                    allow-clear
                  />
                </Form.Item>
              </div>
              <div class="form-wrapper-right">
                <Form.Item :label="t('business.class.color')" :colon="false">
                  <TheColor style="width: 160px" v-model:color="formState.color" />
                </Form.Item>
              </div>
            </div>
            <div class="form-wrapper">
              <div class="form-wrapper-left">
                <Form.Item :label="t('business.class.toolTypeText')" :colon="false">
                  <Select
                    style="width: 160px"
                    v-model:value="formState.toolType"
                    @change="handleChangeToolType"
                  >
                    <Select.Option v-for="item in toolTypeOption" :key="item.id" :value="item.type">
                      <div class="img-tool">
                        <img :src="item.img" alt="" />
                        <span>{{ item.text }}</span>
                      </div>
                    </Select.Option>
                  </Select>
                </Form.Item>
              </div>
            </div>
            <div class="form-wrapper">
              <div class="form-wrapper-left">
                <Form.Item
                  v-if="showConstraintsForLidar"
                  :label="t('business.class.constraints')"
                  :colon="false"
                >
                  <Switch v-model:checked="formState.isConstraints" />
                </Form.Item>
              </div>
            </div>
            <!-- Standard -->
            <template v-if="showStandard">
              <div class="form-wrapper">
                <div class="form-wrapper-left">
                  <Form.Item
                    :label="t('business.ontology.modal.constraints.standard')"
                    :colon="false"
                  >
                    <Switch v-model:checked="formState.isStandard" />
                  </Form.Item>
                </div>
                <TheStandard
                  :isStandard="(formState.isStandard as boolean)"
                  v-model:points="formState.points"
                  v-model:length="formState.length"
                  v-model:width="formState.width"
                  v-model:height="formState.height"
                />
              </div>
            </template>
            <!-- Image -->
            <Form.Item
              v-if="showConstraintsForImage"
              :label="t('business.class.constraints')"
              :colon="false"
            >
              <Switch v-model:checked="formState.isConstraintsForImage" />
            </Form.Item>
            <div v-if="showImageInfo" class="text-center">
              <TheImageInfo
                v-model:imageLimit="formState.imageLimit"
                v-model:imageLength="formState.imageLength"
                v-model:imageWidth="formState.imageWidth"
                v-model:imageArea="formState.imageArea"
              />
            </div>
          </Form>
        </div>
      </div>
      <div v-if="props.isCenter" class="content-item">
        <div class="title">Related by ({{ relatedNum }})</div>
      </div>
      <div v-else class="content-item">
        <div class="title">
          Related to
          <Tooltip :overlayStyle="{ width: '320px' }">
            <template #title>
              This can only be linked to {{ formState.toolType }}
              classes in ontology center, after that you can scenario search across datasets
            </template>
            <ExclamationCircleOutlined style="transform: rotate(180deg)" />
          </Tooltip>
        </div>
        <div class="content">
          <TheRelated
            :dataSchema="dataSchema"
            :datasetId="props.datasetId"
            :isCenter="props.isCenter"
            :toolType="formState.toolType"
            :datasetType="props.datasetType as datasetTypeEnum "
            v-model:ontologyId="formState.ontologyId"
            v-model:classId="formState.classId"
            @update="handleUpdateDataSchema"
          />
        </div>
      </div>
      <div class="content-item">
        <div class="title">
          <span>Attributes ({{ attributesNum }})</span>
          <TheManage
            :isCenter="props.isCenter"
            :activeTab="ClassTypeEnum.CLASS"
            @manage="handleManageAttr"
          />
        </div>
      </div>
    </div>
  </BasicModal>
  <!-- Modal -->
  <TheAttributes
    @register="registerAttrModal"
    @back="handleBack"
    @update="handleUpdateDataSchema"
    :formState="formState"
    :dataSchema="dataSchema"
    :activeTab="ClassTypeEnum.CLASS"
    :datasetType="props.datasetType"
    :datasetId="props.datasetId"
    :isCenter="props.isCenter"
    :title="`${modalTitle}/Attributes`"
  />
</template>

<script lang="ts" setup>
  import { ref, reactive, computed, watch, unref, inject, nextTick, provide } from 'vue';
  // components
  import { Form, Select, Switch, Input, Tooltip } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  // import { RuleObject } from 'ant-design-vue/es/form/interface';
  import { useModal, BasicModal, useModalInner } from '/@/components/Modal';
  import TheColor from './TheColor.vue';
  import TheStandard from './TheStandard.vue';
  import TheImageInfo from './TheImageInfo.vue';
  import TheRelated from './TheRelated.vue';
  import TheManage from './TheManage.vue';
  import TheAttributes from '../attributes/TheAttributes.vue';
  import { toolTypeList } from '../attributes/data';
  // utils
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import emitter from 'tiny-emitter/instance';
  import {
    getCreateClassParams,
    getDefaultCreateClassFormState,
    handleAddUuid,
    isObjectChanged,
    validateName,
  } from './utils';
  // interface
  import { ICLassForm, IDataSchema, imageConstraintsEnum } from './typing';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';
  import { ToolTypeEnum } from '/@/api/business/model/classModel';
  import { ClassTypeEnum } from '/@/api/business/model/classModel';
  import {
    updateOntologyClassApi,
    createOntologyClassApi,
    createDatasetClassApi,
    updateDatasetClassApi,
  } from '/@/api/business/classes';
  import _ from 'lodash';

  const { t } = useI18n();
  const { createMessage } = useMessage();
  // const handleRefresh = inject('handleRefresh', Function, true);
  const props = withDefaults(
    defineProps<{
      detail?: any;
      datasetType?: datasetTypeEnum;
      datasetId?: number;
      ontologyId?: number;
      isCenter?: boolean;
    }>(),
    {
      isCenter: false,
    },
  );
  const emits = defineEmits(['fetchList', 'submit', 'valid', 'changed', 'manage']);
  const updateDetail = inject('updateDetail', Function, true);

  /** Init */
  const relatedNum = ref<number>(0);
  const baseFormName = ref<string>('');
  const modalTitle = ref<string>('Create New Class');
  const okText = ref<string>('Create');
  const [registerModal, { closeModal, changeOkLoading, setModalProps, changeLoading }] =
    useModalInner((config) => {
      if (config.isKeep) {
        return;
      }
      console.log('createClass detail', props.detail);
      // from Edit
      if (config.isEdit) {
        modalTitle.value = 'Edit Class';
        okText.value = 'Save';
        setModalProps({
          title: 'Edit Class',
          okText: 'Save',
        });

        relatedNum.value = props.detail.datasetClassNum ?? 0;
        baseFormName.value = props.detail.name;
        emitter.emit('changeRootName', props.detail.name);

        formState.name = props.detail.name;
        formState.color = props.detail.color ?? '#7dfaf2';
        formState.toolType = props.detail.toolType;
        nextTick(() => {
          formState.ontologyId = props.detail?.ontologyId;
          formState.classId = props.detail?.classId;
        });

        if (props.detail?.toolTypeOptions) {
          const toolTypeOptions = JSON.parse(JSON.stringify(props.detail.toolTypeOptions));
          if (props.datasetType != datasetTypeEnum.IMAGE) {
            formState.isConstraints = toolTypeOptions.isConstraints;
            formState.isStandard = toolTypeOptions?.isStandard;
            if (!formState.isStandard) {
              // If isStandard is false, you need to manually end the non-first listening
              standardEcho.value++;
              formState.length = toolTypeOptions?.length;
              formState.width = toolTypeOptions?.width;
              formState.height = toolTypeOptions?.height;
            } else {
              formState.length = toolTypeOptions?.length;
              formState.width = toolTypeOptions?.width;
              formState.height = toolTypeOptions?.height;
            }
            formState.points = toolTypeOptions?.points;
          } else {
            formState.isConstraintsForImage = toolTypeOptions.isConstraintsForImage;
            formState.imageLimit = toolTypeOptions?.imageLimit;
            formState.imageLength = toolTypeOptions?.imageLength;
            formState.imageWidth = toolTypeOptions?.imageWidth;
            formState.imageArea = toolTypeOptions?.imageArea;
          }
        }

        dataSchema.value = { attributes: props.detail.attributes ?? [] };

        defaultFormState.value = JSON.parse(JSON.stringify(unref(props.detail)));
      } else {
        modalTitle.value = 'Create New Class';
        okText.value = 'Create';
        setModalProps({
          title: 'Create New Class',
          okText: 'Create',
        });
        // Non-echo isStandard is false, you need to manually end it. Not the first monitoring
        standardEcho.value++;

        relatedNum.value = 0;
        formState.name = undefined;
        formState.color = '#7dfaf2';
        formState.toolType =
          props.datasetType == datasetTypeEnum.IMAGE
            ? ToolTypeEnum.BOUNDING_BOX
            : ToolTypeEnum.CUBOID;

        dataSchema.value = { attributes: [] };
        defaultFormState.value = JSON.parse(JSON.stringify(unref(formState)));
      }
      console.log(formState);
    });
  provide('changeLoading', changeLoading);

  /** Form */
  const formRef = ref();
  const formState: ICLassForm = reactive({});
  getDefaultCreateClassFormState(formState);
  defineExpose({ formState });
  /** Rules */
  const rules = {
    name: [
      { required: true, validator: validateName, trigger: 'change' },
      { max: 256, message: t('business.ontology.maxLength') },
    ],
  };
  watch(
    () => props.datasetType,
    (newVal, oldVal) => {
      if (newVal == datasetTypeEnum.IMAGE) {
        formState.toolType = ToolTypeEnum.POLYGON;
        formState.isConstraints = false;
        formState.isConstraintsForImage = false;

        formState.isStandard = false;
        formState.length = undefined;
        formState.width = undefined;
        formState.height = undefined;
        formState.points = undefined;

        formState.imageLength = [undefined, undefined];
        formState.imageWidth = [undefined, undefined];
        formState.imageArea = [undefined, undefined];
      } else if (oldVal == datasetTypeEnum.IMAGE || !oldVal) {
        formState.toolType = ToolTypeEnum.CUBOID;
      }
    },
  );
  // Watch isConstraints changes and reset isStandard
  watch(
    () => formState.isConstraints,
    (newVal) => {
      if (!newVal) {
        formState.isStandard = false;
        formState.length = [undefined, undefined];
        formState.width = [undefined, undefined];
        formState.height = [undefined, undefined];
        formState.points = undefined;
      }
    },
  );
  // Watch standard changes and reset field values
  const standardEcho = ref<number>(0);
  watch(
    () => formState.isStandard,
    (newVal) => {
      if (standardEcho.value == 0) {
        // Remove the first listener whose isStandard is true when echoing
        standardEcho.value++;
        return;
      }
      if (newVal) {
        formState.length = undefined;
        formState.width = undefined;
        formState.height = undefined;
      } else {
        formState.length = [undefined, undefined];
        formState.width = [undefined, undefined];
        formState.height = [undefined, undefined];
      }
      formState.points = undefined;
    },
  );
  // Watch imageLimit changes and reset field values
  watch(
    () => formState.imageLimit,
    (newVal) => {
      if (newVal == imageConstraintsEnum.SIZE) {
        formState.imageArea = [undefined, undefined];
      } else {
        formState.imageLength = [undefined, undefined];
        formState.imageWidth = [undefined, undefined];
      }
    },
  );
  // Watch isConstraintsForImage changes and reset isStandard
  watch(
    () => formState.isConstraintsForImage,
    (newVal) => {
      if (!newVal) {
        formState.imageLength = [undefined, undefined];
        formState.imageWidth = [undefined, undefined];
        formState.imageArea = [undefined, undefined];
      }
    },
  );

  // isChanged?
  // The default FormState
  const defaultFormState = ref<any>({});
  // Watch data changes
  const stopWatchFormState = watch(formState, (value) => {
    const flag = isObjectChanged(unref(defaultFormState), unref(value));
    if (!flag) {
      emits('changed');
      stopWatchFormState();
    }
  });

  // toolType drop down options
  const toolTypeOption = computed(() => {
    if (props.datasetType != datasetTypeEnum.IMAGE) {
      return toolTypeList.filter((item) => item.type === ToolTypeEnum.CUBOID);
    } else {
      return toolTypeList.filter((item) => item.type !== ToolTypeEnum.CUBOID);
    }
  });

  // Lidar Start
  // whether to display constraints
  const showConstraintsForLidar = computed(() => {
    if (formState.toolType == ToolTypeEnum.CUBOID) {
      return true;
    } else {
      return false;
    }
  });
  // whether to display standard box
  const showStandard = computed(() => {
    return showConstraintsForLidar.value && formState.isConstraints;
  });

  // Image Start
  const showConstraintsForImage = computed(() => {
    return false;
    if (formState.toolType != ToolTypeEnum.CUBOID) {
      return true;
    } else {
      return false;
    }
  });
  const showImageInfo = computed(() => {
    return showConstraintsForImage.value && formState.isConstraintsForImage;
  });

  const handleChangeToolType = () => {
    emitter.emit('resetSelect');
    // TODO 判断是否继续更改
  };

  /** Manage Attributes */
  const dataSchema = ref<IDataSchema>({ attributes: [] });
  const attributesNum = computed(() => {
    return dataSchema.value.attributes!.length ?? 0;
  });
  const handleUpdateDataSchema = (newDataSchema: IDataSchema) => {
    dataSchema.value = newDataSchema;
  };

  const [registerAttrModal, { openModal: openAttrModal, closeModal: closeAttrModal }] = useModal();
  const handleManageAttr = () => {
    openAttrModal(true, {});
  };
  const handleBack = () => {
    closeAttrModal();
  };

  /** Cancel */
  const handleCancel = () => {
    getDefaultCreateClassFormState(formState);
    updateDetail({});
    closeModal();
  };
  const handleReset = () => {
    dataSchema.value = { attributes: [] };
  };

  /** Create */
  const handleCreateSave = async (data) => {
    console.log('createSave: ', data);

    await formRef.value.validate();

    handleAddUuid(dataSchema.value.attributes);

    const params = getCreateClassParams({
      formState: _.cloneDeep(formState),
      props: _.cloneDeep(props),
      dataSchema: _.cloneDeep(unref(dataSchema)),
    });
    console.log('The create/save params is :', params);

    try {
      changeOkLoading(true);
      if (props.isCenter) {
        if (params.id) {
          await updateOntologyClassApi(params);
        } else {
          await createOntologyClassApi(params);
        }
      } else {
        if (params.id) {
          await updateDatasetClassApi(params);
        } else {
          await createDatasetClassApi(params);
        }
      }
      handleReset();
      handleCancel();
      emits('fetchList');
    } catch (error) {
      createMessage.error(String(error));
    }
    changeOkLoading(false);
  };
</script>

<style lang="less" scoped>
  @import url(./index.less);
</style>
