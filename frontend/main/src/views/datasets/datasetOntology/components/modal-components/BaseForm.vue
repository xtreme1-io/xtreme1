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
      <!-- 0.3 版本取消，由外部传入 -->
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
  // 组件
  import { Form, Divider, Input, Select, Switch, InputNumber, Radio } from 'ant-design-vue';
  import { RuleObject } from 'ant-design-vue/es/form/interface';
  import OptionEditor from './OptionEditor.vue';
  import randomSvg from '/@/assets/svg/ontology/random.svg';
  // 工具
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
  // 类型
  import {
    ClassTypeEnum,
    ToolTypeEnum,
    datasetTypeEnum,
    inputTypeEnum,
  } from '/@/api/business/model/ontologyClassesModel';
  // 接口
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

  // form 表单
  const labelCol = { span: 11 };
  const wrapperCol = { span: 12, offset: 1 };
  const formRef = ref();
  // 类型
  let formState: BaseForm = reactive({
    name: undefined,
    color: '#7dfaf2',
    datasetType: datasetTypeEnum.IMAGE,
    toolType: ToolTypeEnum.BOUNDING_BOX,
    isConstraints: false,
    isConstraintsForImage: false,
    inputType: inputTypeEnum.RADIO,
    isRequired: false,
    // 0.3.5 add
    isStandard: false,
    length: [undefined, undefined],
    width: [undefined, undefined],
    height: [undefined, undefined],
    points: undefined,
    // 0.5 add
    imageLimit: imageConstraintsEnum.SIZE,
    imageLength: [undefined, undefined],
    imageWidth: [undefined, undefined],
    imageArea: [undefined, undefined],
  });
  defineExpose({ formState });

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

    // 判断值是否存在
    if (left == null || right == null) return;

    if (!flag) {
      // 离开左侧框
      // 判断改变右侧最小值
      if (right == minStandard) formState[target][1] += 0.1;
      // 改变左侧值
      if (left >= right) {
        formState[target][0] = right - 0.1;
        createMessage.error(t('business.ontology.modal.standardValidateMin'));
      }
    } else {
      // 离开右侧框
      // 判断改变左侧最大值
      if (left == maxStandard) formState[target][0] -= 0.1;
      // 改变右框值
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

      // 判断值是否存在
      if (left == null || right == null) return;

      if (!flag) {
        // 离开左侧框
        // 判断改变右侧最小值
        if (right == minStandard) formState[target][1] += 0.1;
        // 改变左侧值
        if (left >= right) {
          formState[target][0] = right - 0.1;
          // createMessage.error(t('business.ontology.modal.standardValidateMin'));
        }
      } else {
        // 离开右侧框
        // 判断改变左侧最大值
        if (left == maxStandard) formState[target][0] -= 0.1;
        // 改变右框值
        if (left >= right) {
          formState[target][1] = left + 0.1;
          // createMessage.error(t('business.ontology.modal.standardValidateMax'));
        }
      }
    }, 500);
  };

  // 校验 name 方法
  const validateName = async (_rule: RuleObject, value: string) => {
    if (!value) {
      afterValid(false);
      return Promise.reject(t('business.ontology.modal.nameRequired'));
    } else {
      // 判断 OntologyCenter | DatasetOntology
      if (!props.isCenter) {
        // console.log('dataset - valid');

        // OntologyCenter
        // -- 在 dataset 下面，需要进行重名校验
        // -- 在 mounted 里获取 name ，这里进行比较
        if (value === baseFormName.value) {
          // name 未改变，不进行重名校验
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
        // -- 在 ontology 下面，不进行重名校验
        afterValid(true, value);
        return Promise.resolve();
      }
    }
  };
  // 校验后的方法
  const afterValid = (isValid: boolean, newName?: string) => {
    if (isValid) {
      emits('valid', false); // 通过校验，提交给 formModal ，控制按钮禁用
      emitter.emit('changeRootName', newName); // 改变 tree 的根节点
    } else {
      emits('valid', true);
    }
  };
  // 校验规则
  const rules = {
    name: [
      { required: true, validator: validateName, trigger: 'blur' },
      { max: 256, message: t('business.ontology.maxLength') },
    ],
  };
  // 失焦校验
  const handleBlur = () => {
    formRef.value.validate();
  };
  const handleNameChange = () => {
    // console.log(formState.name);
    if (!formState.name) emits('valid', true);
    else emits('valid', false);
  };
  // 主动校验
  const handleValid = async () => {
    try {
      await formRef.value.validate();
      return true;
    } catch {
      emits('valid', true);
      return false;
    }
  };

  // 0.3版本不需要 datasetType 下拉框了，但这里还是需要监听 datasetType 来设置 toolType 的值
  // 监听 datasetType 改变事件
  // datasetType -> ontologyType
  watch(
    () => formState.datasetType,
    (newVal, oldVal) => {
      console.log('datasetType changed');

      if (newVal == datasetTypeEnum.IMAGE) {
        formState.toolType = ToolTypeEnum.POLYGON;
        formState.isConstraints = false;
        formState.isConstraintsForImage = false;
        // 0.3.5 add
        // formState.defaultHeight = '';
        // formState.minHeight = '';
        // formState.minPoints = '';
        formState.isStandard = false;
        formState.length = undefined;
        formState.width = undefined;
        formState.height = undefined;
        formState.points = undefined;
        // 0.5 add
        formState.imageLength = [undefined, undefined];
        formState.imageWidth = [undefined, undefined];
        formState.imageArea = [undefined, undefined];
      } else if (oldVal == datasetTypeEnum.IMAGE || !oldVal) {
        formState.toolType = ToolTypeEnum.CUBOID;
      }

      // if (newVal == datasetTypeEnum.LIDAR_BASIC || newVal == datasetTypeEnum.LIDAR_FUSION) {
      //   formState.isConstraints = true;
      //   formState.isConstraintsForImage = false;
      // }
    },
  );

  // toolType下拉选项
  const toolTypeOption = computed(() => {
    if (formState.datasetType != datasetTypeEnum.IMAGE) {
      return toolTypeList.filter((item) => item.type === ToolTypeEnum.CUBOID);
    } else {
      return toolTypeList.filter((item) => item.type !== ToolTypeEnum.CUBOID);
    }
  });
  // Lidar ----------------------------------------
  // 是否显示 constraints
  const showConstraintsForLidar = computed(() => {
    if (formState.toolType == ToolTypeEnum.CUBOID) {
      return true;
    } else {
      return false;
    }
  });
  // 是否显示 标准框  字段
  const showStandard = computed(() => {
    // console.log('showStandard', formState);
    return showConstraintsForLidar.value && formState.isConstraints;
  });
  // ----------------------------------------------
  // Image ----------------------------------------
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
  // 监听 isConstraints 变化，重置 isStandard
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
  // 监听 isConstraintsForImage 变化，重置 isStandard
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
  // 监听 standard 变化，重置 字段值
  const standardEcho = ref<number>(0);
  watch(
    () => formState.isStandard,
    (newVal) => {
      if (standardEcho.value == 0) {
        // 去除 回显时 isStandard 为 true 的第一次监听
        standardEcho.value++;
        return;
      }
      // console.log(newVal, formState);
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
  // 监听 imageLimit 变化， 重置 字段值
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
  // 显示选取颜色
  const showColor = ref<boolean>(false);
  // 获取颜色
  const handleGetColor = (color: string) => {
    formState.color = color;
    showColor.value = false;
  };
  // 随机颜色
  const handleRandomColor = () => {
    const num: number = Math.round(Math.random() * 8);
    formState.color = colorOption.filter((item) => item != formState.color)[num];
  };
  // 监听 inputType 变化
  watch(
    () => formState.inputType,
    (newVal) => {
      // console.log('BaseForm inputType changed');
      if (newVal === inputTypeEnum.TEXT) {
        isShow.value = false;
        // 需要清空 options
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

  // 默认的 FormState
  const defaultFormState = ref<any>({});
  // 监听数据变化
  const stopWatchFormState = watch(formState, (value) => {
    const flag = isObjectChange(unref(defaultFormState), unref(value));

    // console.log('BaseForm formState changed', flag);
    if (!flag) {
      // console.log('emits, stop');
      // 抛出改变状态事件
      emits('changed');
      // 停止监听
      stopWatchFormState();
      // emitter.emit('handleSaveForm', { type: 'change' });
    }
  });

  // 判断对象是否相等
  const isObjectChange = (source, comparison): boolean => {
    // 后台返回的 string 数据比当前 stringify 多了空格
    // -- 所以这里无法比较
    const _source = JSON.stringify(source);
    const _comparison = JSON.stringify({ ...source, ...comparison });
    // console.log(_source);
    // console.log(_comparison);

    return _source == _comparison;
  };

  const isShow = ref<boolean>(true);

  // 页面初始加载
  const baseFormName = ref<string>('');
  onMounted(() => {
    // console.log('onMounted');
    // edit -- 回显
    if (props.detail) {
      console.log('detail ===> ', props.detail);
      // copy 的时候也有回显，这里对是否有 id 进行判断，有则是 edit，否则是 copy
      if (props?.detail?.id) {
        baseFormName.value = props.detail.name;
      }

      // 改变 tree 的根节点
      emitter.emit('changeRootName', props.detail.name);

      const formData: BaseForm = reactive(Object.assign(formState, props.detail));
      handleMutiTabAction(
        props.activeTab,
        () => {
          // 0.3版本改为： datasetType都是传进来的
          formData.datasetType = unref(props.datasetType) as datasetTypeEnum;
          if (props.detail?.toolTypeOptions) {
            const toolTypeOptions = JSON.parse(JSON.stringify(props.detail.toolTypeOptions));
            console.log('props.datasetType', props.datasetType);
            // 0.5 调整为根据 datasetType 来回显 toolTypeOptions
            if (props.datasetType != datasetTypeEnum.IMAGE) {
              formData.isConstraints = toolTypeOptions.isConstraints;
              // 0.3.5 add
              formData.isStandard = toolTypeOptions?.isStandard;
              if (!formData.isStandard) {
                // isStandard 为 false 需要手动结束 非第一次监听
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
              // 0.5 add
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
      // 赋值
      formState = reactive(formData);
      defaultFormState.value = JSON.parse(JSON.stringify(unref(formData)));
    } else {
      // 非回显 isStandard 为 false 需要手动结束 非第一次监听
      standardEcho.value++;
      // 非 center 页面, datasetType是传进来的
      const formData: BaseForm = reactive(Object.assign(formState));

      // if (!props.isCenter) {
      //   formData.datasetType = unref(props.datasetType) as datasetTypeEnum;
      // }
      // 0.3版本改为： datasetType都是传进来的
      formData.datasetType = unref(props.datasetType) as datasetTypeEnum;
      // 赋值
      formState = reactive(formData);
      defaultFormState.value = JSON.parse(JSON.stringify(unref(formData)));
    }
  });

  // 提交
  const handleSubmit = async () => {
    // 先校验
    const isValid = await handleValid();
    if (isValid) {
      // let data = props.activeTab === ClassTypeEnum.CLASS ? { ...formState } : { ...formState };
      let data: BaseForm = { ...formState };
      // 传值给父组件，触发父组件的总提交
      console.log('baseForm--', data);
      emits('submit', data);
    }
  };
  // 由 formModal 来触发
  emitter.off('handleSubmitForm');
  emitter.on('handleSubmitForm', function () {
    // 调用当前表单的提交，去校验表单
    handleSubmit();
  });

  // 传给子组件，判断显示字段
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
      // &.active {
      //   color: @primary-color;
      // }
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
