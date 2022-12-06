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
    <div class="create_content">
      <div class="content-item">
        <div class="title">Basic Info</div>
        <Form
          ref="formRef"
          :model="formState"
          :rules="rules"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          hideRequiredMark
          labelAlign="left"
        >
          <div class="form-wrapper">
            <div class="w-260px">
              <Form.Item :label="t('common.nameText')" name="name">
                <Input
                  style="width: 160px"
                  autocomplete="off"
                  v-model:value="formState.name"
                  :placeholder="t('business.ontology.createHolder')"
                  allow-clear
                />
              </Form.Item>
            </div>
            <div class="flex-1">
              <Form.Item
                :label="t('business.class.color')"
                :labelCol="{ span: 5 }"
                :wrapperCol="wrapperCol"
              >
                <TheColor style="width: 160px" v-model:color="formState.color" />
              </Form.Item>
            </div>
          </div>
          <div class="form-wrapper">
            <!-- <div class="w-260px">
            <Form.Item v-if="props.isCenter" :label="t('business.ontology.ontologyType')">
              <Select v-model:value="formState.datasetType" :options="datasetTypeList" disabled />
            </Form.Item>
          </div> -->
            <div class="w-260px">
              <Form.Item :label="t('business.class.toolTypeText')">
                <Select style="width: 160px" v-model:value="formState.toolType">
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
            <div class="w-260px">
              <Form.Item v-if="showConstraintsForLidar" :label="t('business.class.constraints')">
                <Switch v-model:checked="formState.isConstraints" />
              </Form.Item>
            </div>
          </div>
          <!-- Standard -->
          <template v-if="showStandard">
            <div class="w-260px">
              <Form.Item :label="t('business.ontology.modal.constraints.standard')">
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
          </template>
          <!-- Image -->
          <Form.Item v-if="showConstraintsForImage" :label="t('business.class.constraints')">
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
      <div class="content-item">
        <div class="title">Related by (999)</div>
      </div>
      <div class="content-item">
        <div class="title">
          <span>Attributes (N)</span>
          <Button type="primary" @click="handleManageAttr">
            {{ 'Manage attributes' }}
          </Button>
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
    :classId="props.classId"
    :title="`${modalTitle}/Attributes`"
  />
</template>

<script lang="ts" setup>
  import { ref, reactive, computed, watch, unref } from 'vue';
  // components
  import { Form, Select, Switch, Input } from 'ant-design-vue';
  // import { RuleObject } from 'ant-design-vue/es/form/interface';
  import { useModal, BasicModal, useModalInner } from '/@/components/Modal';
  import { Button } from '/@@/Button';
  import TheColor from './TheColor.vue';
  import TheStandard from './TheStandard.vue';
  import TheImageInfo from './TheImageInfo.vue';
  import TheAttributes from '../attributes/TheAttributes.vue';
  import { toolTypeList } from '../attributes/data';
  // utils
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import emitter from 'tiny-emitter/instance';
  import { handleAddUuid, validateName } from './utils';
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

  const { t } = useI18n();
  const { createMessage } = useMessage();
  // const handleRefresh = inject('handleRefresh', Function, true);
  const props = defineProps<{
    detail?: any;
    isCenter?: boolean;
    datasetType?: datasetTypeEnum;
    datasetId?: number;
    ontologyId?: number | null; // for edit
    classId?: number;
  }>();
  const emits = defineEmits(['fetchList', 'submit', 'valid', 'changed', 'manage']);

  /** Init */
  const baseFormName = ref<string>('');
  const modalTitle = ref<string>('Create New Class');
  const okText = ref<string>('Create');
  const [registerModal, { closeModal, changeOkLoading, setModalProps }] = useModalInner(
    (config) => {
      console.log(config);
      // from attributes
      if (config.isKeep) {
        console.log(formState);
        return;
      }
      console.log(props.detail);
      // from Edit
      if (config.isEdit) {
        modalTitle.value = 'Edit Class';
        okText.value = 'Save';
        setModalProps({
          title: 'Edit Class',
          okText: 'Save',
        });
        formState.name = props.detail.name;
        baseFormName.value = props.detail.name;
        emitter.emit('changeRootName', props.detail.name);

        formState.datasetType = unref(props.datasetType) as datasetTypeEnum;
        formState.color = props.detail.color;
        if (props.detail?.toolTypeOptions) {
          const toolTypeOptions = JSON.parse(JSON.stringify(props.detail.toolTypeOptions));
          console.log('props.datasetType', props.datasetType);
          // echo toolTypeOptions based on datasetType
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

        dataSchema.value = {
          attributes: props.detail.attributes ?? [],
        };

        defaultFormState.value = JSON.parse(JSON.stringify(unref(props.detail)));
      } else {
        modalTitle.value = 'Create New Class';
        okText.value = 'Create';
        setModalProps({
          title: 'Create New Class',
          okText: 'Create',
        });
        dataSchema.value = {
          attributes: [],
        };
        // Non-echo isStandard is false, you need to manually end it. Not the first monitoring
        standardEcho.value++;
        formState.name = undefined;
        defaultFormState.value = JSON.parse(JSON.stringify(unref(formState)));
      }
      console.log(formState);
    },
  );

  /** Form */
  const labelCol = { span: 8 };
  const wrapperCol = { span: 12, offset: 1 };
  const formRef = ref();
  const formState: ICLassForm = reactive({
    name: undefined,
    color: '#7dfaf2',
    datasetType: datasetTypeEnum.IMAGE,
    toolType: ToolTypeEnum.BOUNDING_BOX,
    isConstraints: false,
    isStandard: false,
    length: [undefined, undefined],
    width: [undefined, undefined],
    height: [undefined, undefined],
    points: undefined,
    isConstraintsForImage: false,
    imageLimit: imageConstraintsEnum.SIZE,
    imageLength: [undefined, undefined],
    imageWidth: [undefined, undefined],
    imageArea: [undefined, undefined],
  });
  defineExpose({ formState });
  /** Rules */
  const rules = {
    name: [
      { required: true, validator: validateName, trigger: 'change' },
      { max: 256, message: t('business.ontology.maxLength') },
    ],
  };
  watch(
    () => formState.datasetType,
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
      console.log('isConstraints changed');
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
      console.log('isStandard changed');
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
      console.log('isConstraintsForImage changed');
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
    const flag = isObjectChange(unref(defaultFormState), unref(value));
    if (!flag) {
      // Throws a change state event
      emits('changed');
      // Stop Watch
      stopWatchFormState();
      // emitter.emit('handleSaveForm', { type: 'change' });
    }
  });
  // Check if objects are equal
  const isObjectChange = (source, comparison): boolean => {
    const _source = JSON.stringify(source);
    const _comparison = JSON.stringify({ ...source, ...comparison });

    return _source == _comparison;
  };

  // toolType drop down options
  const toolTypeOption = computed(() => {
    if (formState.datasetType != datasetTypeEnum.IMAGE) {
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

  /** Manage Attributes */
  const dataSchema = ref<IDataSchema>({ attributes: [] });
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
    const params: any = {
      id: props.detail?.id ?? undefined,
      ontologyId: props.ontologyId ?? undefined,
      name: formState.name as string,
      color: formState.color,
      toolType: formState.toolType,
      toolTypeOptions: {},
      attributes: dataSchema.value.attributes as any[],
      datasetId: props.datasetId ?? undefined,
      classId: props.classId ?? undefined,
    };
    if (formState.datasetType != datasetTypeEnum.IMAGE) {
      params.toolTypeOptions = {
        isConstraints: formState.isConstraints ?? false,
        isStandard: formState.isStandard ?? false,
        length: formState.length,
        width: formState.width,
        height: formState.height,
        points: formState.points,
      };
    } else {
      params.toolTypeOptions = {
        isConstraintsForImage: formState.isConstraintsForImage ?? false,
        imageLimit: formState.imageLimit,
        imageLength: formState.imageLength,
        imageWidth: formState.imageWidth,
        imageArea: formState.imageArea,
      };
    }
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
      closeModal();
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
