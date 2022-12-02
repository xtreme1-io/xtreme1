<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="t('business.ontology.createOntology')"
    :width="640"
    :height="450"
    destroyOnClose
    @cancel="handleCancel"
    @ok="handleCreate"
  >
    <div class="content">
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
              <TheNameInput
                style="width: 160px"
                v-bind="$attrs"
                v-model:name="formState.name"
                :activeTab="ClassTypeEnum.CLASS"
                :datasetId="props.datasetId"
                :isCenter="props.isCenter"
                :baseFormName="baseFormName"
              />
              <!-- <Input
                style="width: 160px"
                autocomplete="off"
                v-model:value="formState.name"
                :placeholder="t('business.ontology.createHolder')"
                @blur="handleBlur"
                @change="handleNameChange"
                allow-clear
              /> -->
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
          <Form.Item v-if="props.isCenter" :label="t('business.ontology.ontologyType')">
            <Select v-model:value="formState.datasetType" :options="datasetTypeList" disabled />
          </Form.Item>
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
      <div class="title">Related by (999)</div>
      <div class="title">
        <span>Attributes (N)</span>
        <Button type="primary" @click="handleManageAttr">
          {{ 'Manage attributes' }}
        </Button>
      </div>
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, reactive, computed, watch, unref, onMounted } from 'vue';
  // 组件
  import { Form, Select, Switch } from 'ant-design-vue';
  // import { RuleObject } from 'ant-design-vue/es/form/interface';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { Button } from '/@@/Button';
  import TheColor from './class-form/TheColor.vue';
  import TheStandard from './class-form/TheStandard.vue';
  import TheImageInfo from './class-form/TheImageInfo.vue';
  import TheNameInput from './class-form/TheNameInput.vue';
  import { datasetTypeList } from './class-form/data';
  // 工具
  import { useI18n } from '/@/hooks/web/useI18n';
  // import { useMessage } from '/@/hooks/web/useMessage'; // 类型
  import emitter from 'tiny-emitter/instance';
  import { ICLassForm, imageConstraintsEnum } from './typing';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';
  import { ClassTypeEnum, ToolTypeEnum } from '/@/api/business/model/classModel';
  import { inputTypeEnum } from '/@/api/business/model/ontologyClassesModel';
  import { toolTypeList } from './class-form/data';

  const { t } = useI18n();
  // const { createMessage } = useMessage();
  // const handleRefresh = inject('handleRefresh', Function, true); // 刷新列表页面
  const props = defineProps<{
    detail?: any;
    isCenter?: boolean;
    datasetType?: datasetTypeEnum;
    datasetId?: number;
  }>();
  const emits = defineEmits(['submit', 'valid', 'changed', 'manage']);

  const [registerModal, { closeModal }] = useModalInner(() => {});

  /** Form */
  const labelCol = { span: 8 };
  const wrapperCol = { span: 12, offset: 1 };
  const formRef = ref();
  let formState: ICLassForm = reactive({
    name: undefined,
    color: '#7dfaf2',
    datasetType: datasetTypeEnum.IMAGE,
    toolType: ToolTypeEnum.BOUNDING_BOX,
    isConstraints: false,
    isConstraintsForImage: false,
    inputType: inputTypeEnum.RADIO,
    isRequired: false,
    isStandard: false,
    length: [undefined, undefined],
    width: [undefined, undefined],
    height: [undefined, undefined],
    points: undefined,
    imageLimit: imageConstraintsEnum.SIZE,
    imageLength: [undefined, undefined],
    imageWidth: [undefined, undefined],
    imageArea: [undefined, undefined],
  });
  defineExpose({ formState });
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

  // /** Validate Name */
  // const validateName = async (_rule: RuleObject, value: string) => {
  //   if (!value) {
  //     afterValid(false);
  //     return Promise.reject(t('business.ontology.modal.nameRequired'));
  //   } else {
  //     // OntologyCenter | DatasetOntology
  //     if (!props.isCenter) {
  //       if (value === baseFormName.value) {
  //         // name has not changed, no duplicate name verification
  //         afterValid(true, value);
  //         return Promise.resolve();
  //       }

  //       const params: ValidateNameParams = {
  //         name: formState.name ?? '',
  //         datasetId: props.datasetId as number,
  //       };
  //       if (props.activeTab == ClassTypeEnum.CLASS) {
  //         try {
  //           const res = await validateClassNameApi(params);
  //           if (!res) {
  //             afterValid(true, value);
  //             return Promise.resolve();
  //           } else {
  //             emits('valid', true);
  //             const text =
  //               t('business.class.class') +
  //               ` "${params.name}" ` +
  //               t('business.ontology.modal.alreadyExits') +
  //               t('business.ontology.modal.enterNewName');
  //             return Promise.reject(text);
  //           }
  //         } catch {}
  //       } else {
  //         try {
  //           const res = await validateClassificationNameApi(params);
  //           if (!res) {
  //             afterValid(true, value);
  //             return Promise.resolve();
  //           } else {
  //             emits('valid', true);
  //             const text =
  //               t('business.class.classification') +
  //               ` "${params.name}" ` +
  //               t('business.ontology.modal.alreadyExits') +
  //               t('business.ontology.modal.enterNewName');
  //             return Promise.reject(text);
  //           }
  //         } catch {}
  //       }
  //     } else {
  //       // DatasetOntology
  //       // -- no duplicate name verification
  //       afterValid(true, value);
  //       return Promise.resolve();
  //     }
  //   }
  // };

  // // method after verification
  // const afterValid = (isValid: boolean, newName?: string) => {
  //   if (isValid) {
  //     emits('valid', false); // Pass validation, submit to formModal , control buttons are disabled
  //     emitter.emit('changeRootName', newName); // Change the root node of tree
  //   } else {
  //     emits('valid', true);
  //   }
  // };

  /** Rules */
  const rules = {
    name: [
      // { required: true, validator: validateName, trigger: 'blur' },
      { max: 256, message: t('business.ontology.maxLength') },
    ],
  };

  // const handleBlur = () => {
  //   formRef.value.validate();
  // };
  // const handleNameChange = () => {
  //   if (!formState.name) emits('valid', true);
  //   else emits('valid', false);
  // };
  /** Cancel */
  const handleCancel = () => {
    closeModal();
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

  // Initial page load
  const baseFormName = ref<string>('');
  onMounted(() => {
    // edit -- Echo
    if (props.detail) {
      console.log('detail ===> ', props.detail);
      // Is there has an id, is Edit, otherwise it is copy
      if (props?.detail?.id) {
        baseFormName.value = props.detail.name;
      }

      // Change the root node of tree
      emitter.emit('changeRootName', props.detail.name);

      const formData: ICLassForm = reactive(Object.assign(formState, props.detail));

      formData.datasetType = unref(props.datasetType) as datasetTypeEnum;
      if (props.detail?.toolTypeOptions) {
        const toolTypeOptions = JSON.parse(JSON.stringify(props.detail.toolTypeOptions));
        console.log('props.datasetType', props.datasetType);
        // echo toolTypeOptions based on datasetType
        if (props.datasetType != datasetTypeEnum.IMAGE) {
          formData.isConstraints = toolTypeOptions.isConstraints;
          formData.isStandard = toolTypeOptions?.isStandard;
          if (!formData.isStandard) {
            // If isStandard is false, you need to manually end the non-first listening
            standardEcho.value++;
            formData.length = toolTypeOptions?.length;
            formData.width = toolTypeOptions?.width;
            formData.height = toolTypeOptions?.height;
          } else {
            formData.length = toolTypeOptions?.length;
            formData.width = toolTypeOptions?.width;
            formData.height = toolTypeOptions?.height;
          }
          formData.points = toolTypeOptions?.points;
        } else {
          formData.isConstraintsForImage = toolTypeOptions.isConstraintsForImage;
          formData.imageLimit = toolTypeOptions?.imageLimit;
          formData.imageLength = toolTypeOptions?.imageLength;
          formData.imageWidth = toolTypeOptions?.imageWidth;
          formData.imageArea = toolTypeOptions?.imageArea;
        }
      }

      // Assign a value
      formState = reactive(formData);
      defaultFormState.value = JSON.parse(JSON.stringify(unref(formData)));
    } else {
      // Non-echo isStandard is false, you need to manually end it. Not the first monitoring
      standardEcho.value++;
      // For non-center pages, datasetType is passed in
      const formData: ICLassForm = reactive(Object.assign(formState));
      formData.datasetType = unref(props.datasetType) as datasetTypeEnum;
      formState = reactive(formData);
      defaultFormState.value = JSON.parse(JSON.stringify(unref(formData)));
    }
  });

  /** Manage */
  const handleManageAttr = () => {
    emits('manage');
  };
  /** Create */
  const isLoading = ref<boolean>(false);
  const handleCreate = () => {
    isLoading.value = true;
  };
</script>

<style lang="less" scoped>
  @import url(./index.less);
</style>
