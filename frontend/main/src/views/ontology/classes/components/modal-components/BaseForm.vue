<template>
  <div class="basic-form">
    <div class="basic-form-tab">
      <div class="title" v-if="props?.indexList && props?.indexList.length == 0">
        {{ t('business.ontology.modal.basicInfo') }}
      </div>
    </div>
    <!-- Form - class -->
    <Form
      v-if="props.activeTab == ClassTypeEnum.CLASS"
      ref="formRef"
      :model="formState"
      :rules="rules"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
      hideRequiredMark
      labelAlign="left"
    >
      <Form.Item :label="t('common.nameText')" name="name">
        <Input
          autocomplete="off"
          v-model:value="formState.name"
          :placeholder="t('business.ontology.createHolder')"
          @blur="handleBlur"
          @change="handleNameChange"
          allow-clear
        />
      </Form.Item>
      <Form.Item :label="t('business.class.color')">
        <div class="base-form-color">
          <div @click.prevent="showColor = !showColor">
            <Input
              autocomplete="off"
              style="background: white; color: #333; cursor: pointer"
              v-model:value="formState.color"
            >
              <template #prefix>
                <span :style="{ background: formState.color, width: '16px', height: '16px' }">
                </span>
              </template>
              <template #suffix>
                <img :src="randomSvg" @click.stop="handleRandomColor" />
              </template>
            </Input>
          </div>
          <div v-if="showColor" class="color-options">
            <span
              v-for="item in colorOption"
              :key="item"
              :style="{ background: item }"
              :data-color="item"
              @click="handleGetColor(item)"
            ></span>
          </div>
        </div>
      </Form.Item>
      <Form.Item v-if="isCenter" :label="t('business.ontology.ontologyType')">
        <Select v-model:value="formState.datasetType" :options="datasetTypeList" disabled />
      </Form.Item>
      <Form.Item :label="t('business.class.toolTypeText')">
        <Select v-model:value="formState.toolType">
          <Select.Option v-for="item in toolTypeOption" :key="item.id" :value="item.type">
            <div class="img-tool">
              <img :src="item.img" alt="" />
              <span>{{ item.text }}</span>
            </div>
          </Select.Option>
        </Select>
      </Form.Item>
      <!-- Lidar -->
      <Form.Item v-if="showConstraintsForLidar" :label="t('business.class.constraints')">
        <Switch v-model:checked="formState.isConstraints" />
      </Form.Item>
      <!-- Image -->
      <Form.Item v-if="showConstraintsForImage" :label="t('business.class.constraints')">
        <Switch v-model:checked="formState.isConstraintsForImage" />
      </Form.Item>
      <!-- Standard -->
      <template v-if="showStandard">
        <Form.Item :label="t('business.ontology.modal.constraints.standard')">
          <Switch v-model:checked="formState.isStandard" />
        </Form.Item>
        <template v-if="formState.isStandard">
          <div class="flex justify-between items-center mb-10px">
            <span class="whitespace-nowrap w-50px">
              {{ t('business.ontology.modal.constraints.length') }}
            </span>
            <div>
              <InputNumber
                :min="minStandard"
                :max="maxStandard"
                :step="stepStandard"
                :precision="precisionStandard"
                autocomplete="off"
                v-model:value="formState.length"
                style="text-align: center; width: 70px; margin-right: 5px"
              />
              <span>
                {{ t('business.ontology.modal.constraints.unitStandard') }}
              </span>
            </div>
          </div>
          <div class="flex justify-between items-center mb-10px">
            <span class="whitespace-nowrap w-50px">
              {{ t('business.ontology.modal.constraints.width') }}
            </span>
            <div>
              <InputNumber
                :min="minStandard"
                :max="maxStandard"
                :step="stepStandard"
                :precision="precisionStandard"
                autocomplete="off"
                v-model:value="formState.width"
                style="text-align: center; width: 70px; margin-right: 5px"
              />
              <span>
                {{ t('business.ontology.modal.constraints.unitStandard') }}
              </span>
            </div>
          </div>
          <div class="flex justify-between items-center mb-10px">
            <span class="whitespace-nowrap w-50px">
              {{ t('business.ontology.modal.constraints.height') }}
            </span>
            <div>
              <InputNumber
                :min="minStandard"
                :max="maxStandard"
                :step="stepStandard"
                :precision="precisionStandard"
                autocomplete="off"
                v-model:value="formState.height"
                style="text-align: center; width: 70px; margin-right: 5px"
              />
              <span>
                {{ t('business.ontology.modal.constraints.unitStandard') }}
              </span>
            </div>
          </div>
          <div class="flex justify-between items-center mb-10px">
            <span class="whitespace-nowrap w-50px">
              {{ t('business.ontology.modal.constraints.points') }}
            </span>
            <div>
              <InputNumber
                :min="minPoints"
                :max="maxPoints"
                :step="stepPoints"
                :precision="precisionPoints"
                autocomplete="off"
                v-model:value="formState.points"
                style="text-align: center; width: 70px; margin-right: 19px"
              />
              <span></span>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="flex justify-between items-center mb-10px">
            <span class="whitespace-nowrap w-50px">
              {{ t('business.ontology.modal.constraints.length') }}
            </span>
            <div>
              <InputNumber
                :min="minStandard"
                :max="maxStandard"
                :step="stepStandard"
                :precision="precisionStandard"
                @blur="handleStandardBlur('length', 0)"
                @change="handleStandardChange('length', 0)"
                placeholder="min"
                autocomplete="off"
                v-model:value="formState.length[0]"
                style="text-align: center; width: 70px; margin-right: 5px"
              />
              <span>
                {{ t('business.ontology.modal.constraints.unitStandard') }}
              </span>
            </div>
            <div>
              <InputNumber
                :min="minStandard"
                :max="maxStandard"
                :step="stepStandard"
                :precision="precisionStandard"
                @blur="handleStandardBlur('length', 1)"
                @change="handleStandardChange('length', 1)"
                placeholder="max"
                autocomplete="off"
                v-model:value="formState.length[1]"
                style="text-align: center; width: 70px; margin-right: 5px"
              />
              <span>
                {{ t('business.ontology.modal.constraints.unitStandard') }}
              </span>
            </div>
          </div>
          <div class="flex justify-between items-center mb-10px">
            <span class="whitespace-nowrap w-50px">
              {{ t('business.ontology.modal.constraints.width') }}
            </span>
            <div>
              <InputNumber
                :min="minStandard"
                :max="maxStandard"
                :step="stepStandard"
                :precision="precisionStandard"
                @blur="handleStandardBlur('width', 0)"
                @change="handleStandardChange('width', 0)"
                placeholder="min"
                autocomplete="off"
                v-model:value="formState.width[0]"
                style="text-align: center; width: 70px; margin-right: 5px"
              />
              <span>
                {{ t('business.ontology.modal.constraints.unitStandard') }}
              </span>
            </div>
            <div>
              <InputNumber
                :min="minStandard"
                :max="maxStandard"
                :step="stepStandard"
                :precision="precisionStandard"
                @blur="handleStandardBlur('width', 1)"
                @change="handleStandardChange('width', 1)"
                placeholder="max"
                autocomplete="off"
                v-model:value="formState.width[1]"
                style="text-align: center; width: 70px; margin-right: 5px"
              />
              <span>
                {{ t('business.ontology.modal.constraints.unitStandard') }}
              </span>
            </div>
          </div>
          <div class="flex justify-between items-center mb-10px">
            <span class="whitespace-nowrap w-50px">
              {{ t('business.ontology.modal.constraints.height') }}
            </span>
            <div>
              <InputNumber
                :min="minStandard"
                :max="maxStandard"
                :step="stepStandard"
                :precision="precisionStandard"
                @blur="handleStandardBlur('height', 0)"
                @change="handleStandardChange('height', 0)"
                placeholder="min"
                autocomplete="off"
                v-model:value="formState.height[0]"
                style="text-align: center; width: 70px; margin-right: 5px"
              />
              <span>
                {{ t('business.ontology.modal.constraints.unitStandard') }}
              </span>
            </div>
            <div>
              <InputNumber
                :min="minStandard"
                :max="maxStandard"
                :step="stepStandard"
                :precision="precisionStandard"
                @blur="handleStandardBlur('height', 1)"
                @change="handleStandardChange('height', 1)"
                placeholder="max"
                autocomplete="off"
                v-model:value="formState.height[1]"
                style="text-align: center; width: 70px; margin-right: 5px"
              />
              <span>
                {{ t('business.ontology.modal.constraints.unitStandard') }}
              </span>
            </div>
          </div>
          <div class="flex justify-between items-center mb-10px">
            <span class="whitespace-nowrap w-50px">
              {{ t('business.ontology.modal.constraints.points') }}
            </span>
            <div>
              <InputNumber
                :min="minPoints"
                :max="maxPoints"
                :step="stepPoints"
                :precision="precisionPoints"
                autocomplete="off"
                v-model:value="formState.points"
                style="text-align: center; width: 70px; margin-right: 19px"
              />
              <span></span>
            </div>
          </div>
        </template>
      </template>
      <!-- ImageInfo -->
      <div v-if="showImageInfo" class="text-center">
        <Radio.Group
          v-model:value="formState.imageLimit"
          button-style="solid"
          style="margin-bottom: 16px"
        >
          <Radio.Button :value="imageConstraintsEnum.SIZE">
            {{ t('business.ontology.modal.constraints.size') }}
          </Radio.Button>
          <Radio.Button :value="imageConstraintsEnum.AREA">
            {{ t('business.ontology.modal.constraints.area') }}
          </Radio.Button>
        </Radio.Group>
        <div v-if="formState.imageLimit == imageConstraintsEnum.SIZE">
          <div class="flex justify-between items-center mb-10px">
            <span class="whitespace-nowrap w-50px">
              {{ t('business.ontology.modal.constraints.length') }}
            </span>
            <div>
              <InputNumber
                placeholder="min"
                autocomplete="off"
                v-model:value="formState.imageLength[0]"
                style="text-align: center; width: 50px; margin-right: 5px"
              />
              <span>
                {{ t('business.ontology.modal.constraints.unitImage') }}
              </span>
            </div>
            <div>
              <InputNumber
                placeholder="max"
                autocomplete="off"
                v-model:value="formState.imageLength[1]"
                style="text-align: center; width: 50px; margin-right: 5px"
              />
              <span>
                {{ t('business.ontology.modal.constraints.unitImage') }}
              </span>
            </div>
          </div>
          <div class="flex justify-between items-center mb-10px">
            <span class="whitespace-nowrap w-50px">
              {{ t('business.ontology.modal.constraints.width') }}
            </span>
            <div>
              <InputNumber
                placeholder="min"
                autocomplete="off"
                v-model:value="formState.imageWidth[0]"
                style="text-align: center; width: 50px; margin-right: 5px"
              />
              <span>
                {{ t('business.ontology.modal.constraints.unitImage') }}
              </span>
            </div>
            <div>
              <InputNumber
                placeholder="max"
                autocomplete="off"
                v-model:value="formState.imageWidth[1]"
                style="text-align: center; width: 50px; margin-right: 5px"
              />
              <span>
                {{ t('business.ontology.modal.constraints.unitImage') }}
              </span>
            </div>
          </div>
        </div>
        <div v-if="formState.imageLimit == imageConstraintsEnum.AREA">
          <div class="flex justify-between items-center mb-10px">
            <span class="whitespace-nowrap w-50px">
              {{ t('business.ontology.modal.constraints.area') }}
            </span>
            <div>
              <InputNumber
                placeholder="min"
                autocomplete="off"
                v-model:value="formState.imageArea[0]"
                style="text-align: center; width: 50px; margin-right: 5px"
              />
              <span>
                {{ t('business.ontology.modal.constraints.unitImage') }}
              </span>
            </div>
            <div>
              <InputNumber
                placeholder="max"
                autocomplete="off"
                v-model:value="formState.imageArea[1]"
                style="text-align: center; width: 50px; margin-right: 5px"
              />
              <span>
                {{ t('business.ontology.modal.constraints.unitImage') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Form>
    <!-- Form - classification -->
    <Form v-else ref="formRef" :model="formState" :rules="rules" hideRequiredMark labelAlign="left">
      <Form.Item :label="t('common.nameText')" name="name">
        <Input
          autocomplete="off"
          v-model:value="formState.name"
          :placeholder="t('business.ontology.createHolder')"
          @blur="handleBlur"
          @change="handleNameChange"
        />
      </Form.Item>
      <Form.Item :label="t('business.class.inputType')">
        <Select v-model:value="formState.inputType">
          <Select.Option v-for="item in inputTypeList" :key="item.key" :value="item.value">
            <div class="img-tool">
              <img :src="item.img" alt="" />
              <span>{{ item.label }}</span>
            </div>
          </Select.Option>
        </Select>
      </Form.Item>
      <Form.Item>
        <Switch v-model:checked="formState.isRequired" />
        <span style="margin-left: 10px">{{ t('business.class.isRequired') }}</span>
      </Form.Item>
    </Form>
    <!-- Form - classification -->
    <Divider style="margin: 10px 0" />
    <OptionEditor
      v-show="isShow"
      :type="editorType"
      :isBasic="true"
      :dataSchema="props.dataSchema"
      :handleSet="handleSet"
      :handleAddIndex="handleAddIndex"
    />
  </div>
</template>
<script lang="ts" setup>
  import { ref, reactive, unref, computed, watch, onMounted } from 'vue';
  import { Form, Divider, Input, Select, Switch, InputNumber, Radio } from 'ant-design-vue';
  import { RuleObject } from 'ant-design-vue/es/form/interface';
  import OptionEditor from './OptionEditor.vue';
  import randomSvg from '/@/assets/svg/ontology/random.svg';
  import emitter from 'tiny-emitter/instance';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import type { BaseForm } from './typing';
  import { handleMutiTabAction } from './utils';
  import {
    toolTypeList,
    inputTypeList,
    colorOption,
    datasetTypeList,
    imageConstraintsEnum,
  } from './data';
  import {
    ClassTypeEnum,
    ToolTypeEnum,
    datasetTypeEnum,
    inputTypeEnum,
  } from '/@/api/business/model/ontologyClassesModel';
  import { ValidateNameParams } from '/@/api/business/model/datasetOntologyModel';
  import {
    validateClassNameApi,
    validateClassificationNameApi,
  } from '/@/api/business/datasetOntology';

  const { t } = useI18n();
  const { createMessage } = useMessage();

  const emits = defineEmits(['submit', 'valid', 'changed']);
  const props = defineProps<{
    detail?: any;
    dataSchema?: any;
    handleSet?: Function;
    handleAddIndex?: Function;
    indexList?: number[];
    activeTab?: ClassTypeEnum;
    isCenter?: boolean;
    datasetType?: datasetTypeEnum;
    datasetId?: number;
    classId?: Nullable<number>;
    classificationId?: Nullable<number>;
  }>();
  const { handleSet, handleAddIndex } = unref(props);

  /** FormState */
  const labelCol = { span: 11 };
  const wrapperCol = { span: 12, offset: 1 };
  const formRef = ref();
  let formState: BaseForm = reactive({
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

  /** Standard Input */
  const minStandard = 0;
  const maxStandard = 10000;
  const stepStandard = 0.1;
  const precisionStandard = 2;
  const minPoints = 0;
  const maxPoints = 2000000;
  const stepPoints = 1;
  const precisionPoints = 0;
  const handleStandardBlur = (target, flag) => {
    const left = formState[target][0];
    const right = formState[target][1];

    // haValue?
    if (left == null || right == null) return;

    if (!flag) {
      // Leave the left box and judge to change the minimum value on the right
      if (right == minStandard) formState[target][1] += 0.1;
      // Change the left value
      if (left >= right) {
        formState[target][0] = right - 0.1;
        createMessage.error(t('business.ontology.modal.standardValidateMin'));
      }
    } else {
      // Leave the box on the right and judge to change the maximum value on the left
      if (left == maxStandard) formState[target][0] -= 0.1;
      // Change the right value
      if (left >= right) {
        formState[target][1] = left + 0.1;
        createMessage.error(t('business.ontology.modal.standardValidateMax'));
      }
    }
  };
  let timer;
  const handleStandardChange = (target, flag) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const left = formState[target][0];
      const right = formState[target][1];

      if (left == null || right == null) return;

      if (!flag) {
        if (right == minStandard) formState[target][1] += 0.1;
        if (left >= right) {
          formState[target][0] = right - 0.1;
          // createMessage.error(t('business.ontology.modal.standardValidateMin'));
        }
      } else {
        if (left == maxStandard) formState[target][0] -= 0.1;
        if (left >= right) {
          formState[target][1] = left + 0.1;
          // createMessage.error(t('business.ontology.modal.standardValidateMax'));
        }
      }
    }, 500);
  };

  /** Validate Name */
  const validateName = async (_rule: RuleObject, value: string) => {
    if (!value) {
      afterValid(false);
      return Promise.reject(t('business.ontology.modal.nameRequired'));
    } else {
      // OntologyCenter | DatasetOntology
      if (!props.isCenter) {
        if (value === baseFormName.value) {
          // name has not changed, no duplicate name verification
          afterValid(true, value);
          return Promise.resolve();
        }

        const params: ValidateNameParams = {
          name: formState.name ?? '',
          datasetId: props.datasetId as number,
        };
        if (props.activeTab == ClassTypeEnum.CLASS) {
          try {
            const res = await validateClassNameApi(params);
            if (!res) {
              afterValid(true, value);
              return Promise.resolve();
            } else {
              emits('valid', true);
              const text =
                t('business.class.class') +
                ` "${params.name}" ` +
                t('business.ontology.modal.alreadyExits') +
                t('business.ontology.modal.enterNewName');
              return Promise.reject(text);
            }
          } catch {}
        } else {
          try {
            const res = await validateClassificationNameApi(params);
            if (!res) {
              afterValid(true, value);
              return Promise.resolve();
            } else {
              emits('valid', true);
              const text =
                t('business.class.classification') +
                ` "${params.name}" ` +
                t('business.ontology.modal.alreadyExits') +
                t('business.ontology.modal.enterNewName');
              return Promise.reject(text);
            }
          } catch {}
        }
      } else {
        // DatasetOntology
        // -- no duplicate name verification
        afterValid(true, value);
        return Promise.resolve();
      }
    }
  };

  // method after verification
  const afterValid = (isValid: boolean, newName?: string) => {
    if (isValid) {
      emits('valid', false); // Pass validation, submit to formModal , control buttons are disabled
      emitter.emit('changeRootName', newName); // Change the root node of tree
    } else {
      emits('valid', true);
    }
  };
  // Check rules
  const rules = {
    name: [
      { required: true, validator: validateName, trigger: 'blur' },
      { max: 256, message: t('business.ontology.maxLength') },
    ],
  };
  // Out of focus check
  const handleBlur = () => {
    formRef.value.validate();
  };
  const handleNameChange = () => {
    if (!formState.name) emits('valid', true);
    else emits('valid', false);
  };
  // Active check
  const handleValid = async () => {
    try {
      await formRef.value.validate();
      return true;
    } catch {
      emits('valid', true);
      return false;
    }
  };

  // Need to monitor datasetType to set the value of toolType
  watch(
    () => formState.datasetType,
    (newVal, oldVal) => {
      console.log('datasetType changed');

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
  // Show selected color
  const showColor = ref<boolean>(false);
  const handleGetColor = (color: string) => {
    formState.color = color;
    showColor.value = false;
  };
  // get random color
  const handleRandomColor = () => {
    const num: number = Math.round(Math.random() * 8);
    formState.color = colorOption.filter((item) => item != formState.color)[num];
  };
  // Watch inputType changes
  watch(
    () => formState.inputType,
    (newVal) => {
      // console.log('BaseForm inputType changed');
      if (newVal === inputTypeEnum.TEXT) {
        isShow.value = false;
        // need clear options
        props.handleSet &&
          props.handleSet({
            setType: 'update',
            setValue: { options: [] },
          });
      } else {
        isShow.value = true;
      }
    },
  );

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

  const isShow = ref<boolean>(true);

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

      const formData: BaseForm = reactive(Object.assign(formState, props.detail));
      handleMutiTabAction(
        props.activeTab,
        () => {
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
        },
        () => {},
      );
      // Assign a value
      formState = reactive(formData);
      defaultFormState.value = JSON.parse(JSON.stringify(unref(formData)));
    } else {
      // Non-echo isStandard is false, you need to manually end it. Not the first monitoring
      standardEcho.value++;
      // For non-center pages, datasetType is passed in
      const formData: BaseForm = reactive(Object.assign(formState));
      formData.datasetType = unref(props.datasetType) as datasetTypeEnum;
      formState = reactive(formData);
      defaultFormState.value = JSON.parse(JSON.stringify(unref(formData)));
    }
  });

  // Submit
  const handleSubmit = async () => {
    // Validate first
    const isValid = await handleValid();
    if (isValid) {
      let data: BaseForm = { ...formState };
      // Pass a value to the parent component to trigger the total submission of the parent component
      console.log('baseForm--', data);
      emits('submit', data);
    }
  };
  // Triggered by formModal
  emitter.off('handleSubmitForm');
  emitter.on('handleSubmitForm', function () {
    // Call the submit of the current form to validate the form
    handleSubmit();
  });
  // Pass it to the child component to judge the display field
  const editorType = computed(() => {
    return props.activeTab === ClassTypeEnum.CLASS ? 'attributes' : 'options';
  });
</script>
<style lang="less" scoped>
  @import url(./index.less);

  .basic-form-tab {
    display: flex;
    justify-content: space-between;
    font-weight: 500; //font-weight: 600;

    font-size: 16px;
    line-height: 19px;
    color: #333;
    margin-bottom: 10px;

    .title {
      font-weight: 500; //font-weight: 600;

      font-size: 16px;
    }

    &-item {
      cursor: pointer;
    }
  }

  .base-form-color {
    position: relative;

    .color-options {
      position: absolute;
      left: -5px;
      top: 32px;
      z-index: 999;
      width: 156px;
      height: 66px;
      border-radius: 4px;
      background: #ffffff;
      box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.15);

      display: grid;
      grid-template-columns: repeat(5, 24px);
      grid-template-rows: repeat(2, 24px);
      gap: 6px;
      justify-content: center;
      align-content: center;

      span {
        width: 100%;
        height: 100%;
        cursor: pointer;

        &:hover {
          box-shadow: 0 0 0 2px #51bede;
        }
      }
    }
  }

  :deep(.ant-radio-group) {
    .ant-radio-button-wrapper {
      &:first-child {
        border-radius: 4px 0 0 4px;
      }

      &:last-child {
        border-radius: 0 4px 4px 0;
      }
    }
  }
</style>
