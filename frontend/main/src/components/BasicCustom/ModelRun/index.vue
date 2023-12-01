<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    destroyOnClose
    :title="props.title"
    :ok-text="t('common.runText')"
    @ok="handleRun"
    @cancel="handleReset"
    centered
    wrapClassName="modelRunModal"
  >
    <!-- 内容 -->
    <div class="run__body">
      <Form :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol" labelAlign="left">
        <Form.Item :label="props.selectName">
          <!-- 名称和值 由 props 接收传入 -->
          <slot name="select"></slot>
        </Form.Item>

        <template v-if="props.modelType !== 'model' && false">
          <Form.Item>
            <Checkbox v-model:checked="formState.checkedData">
              {{ t('business.models.runModel.FliterData') }}
            </Checkbox>
          </Form.Item>

          <div style="margin-left: 35px" v-show="formState.checkedData">
            <Form.Item :label="t('business.models.run.DataCount')">
              <div class="flex mr-20 ml-20">
                {{ getDataCount }}
                <Slider
                  style="flex: 1"
                  :tip-formatter="(value: number) =>  `${value}%`"
                  v-model:value="formState.dataCountRatio"
                  :min="0"
                  :max="100"
                  :step="1"
                />
                {{ formState.dataCountRatio }}%
              </div>
            </Form.Item>
            <Form.Item>
              <Checkbox v-model:checked="formState.isExcludeModelData">
                {{ t('business.models.runModel.excludeData') }}
              </Checkbox>
            </Form.Item>
            <Form.Item
              :label="t('business.models.runModel.Splite')"
              :label-col="{ span: 6 }"
              :wrapper-col="{ span: 20 }"
            >
              <RadioGroup v-model:value="formState.splitType" button-style="solid">
                <Radio value=""> {{ SplitedTypeEnum.All }} </Radio>
                <Radio value="TRAINING"> {{ SplitedTypeEnum.Training }}</Radio>
                <Radio value="VALIDATION"> {{ SplitedTypeEnum.Validation }} </Radio>
                <Radio value="TEST">{{ SplitedTypeEnum.Test }}</Radio>
                <Radio value="NOT_SPLIT"> {{ SplitedTypeEnum.NotSplited }}</Radio>
              </RadioGroup>
            </Form.Item>
            <Form.Item
              :label="t('business.models.runModel.AnnotationStatus')"
              :label-col="{ span: 6 }"
              :wrapper-col="{ span: 20 }"
            >
              <RadioGroup v-model:value="formState.annotationStatus" button-style="solid">
                <Radio value=""> All </Radio>
                <Radio value="ANNOTATED"> Annotated </Radio>
                <Radio value="NOT_ANNOTATED">Not Annotated </Radio>
                <Radio value="INVALID"> Invalid </Radio>
              </RadioGroup>
            </Form.Item>
          </div>
        </template>
        <Form.Item>
          <Checkbox v-model:checked="formState.checkedResult">
            {{ t('business.models.runModel.FliterModel') }}
          </Checkbox>
        </Form.Item>
        <div style="margin-left: 35px" v-show="formState.checkedResult">
          <Form.Item
            :label="t('business.models.runModel.classes')"
            :label-col="{ span: 24 }"
            :wrapper-col="{ span: 24 }"
          >
            <div class="relative">
              <TheTags v-model:classes="formState.tagsList" :datasetType="datasetType" />
              <div v-if="!showSelectAll" class="select__btn" @click="handleToggleSelect(true)">
                {{ t('business.models.runModel.selectAll') }}
              </div>
              <div v-if="showSelectAll" class="select__btn" @click="handleToggleSelect(false)">
                {{ t('business.models.runModel.unselectAll') }}
              </div>
            </div>
          </Form.Item>
          <Form.Item :label="t('business.models.runModel.confidence')">
            <TheSlider
              v-model:start="formState.sliderValue[0]"
              v-model:end="formState.sliderValue[1]"
            />
          </Form.Item>
        </div>
      </Form>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, reactive, computed, watch, watchEffect } from 'vue';

  // 组件
  import { useMessage } from '/@/hooks/web/useMessage';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { Form, Checkbox, RadioGroup, Radio, Slider } from 'ant-design-vue';
  import TheSlider from './TheSlider.vue';
  import TheTags from './TheTags.vue';
  // 工具
  import { useI18n } from '/@/hooks/web/useI18n';
  // 接口
  import {
    ResultsModelParam,
    DataModelParam,
    ModelDataCountParams,
  } from '/@/api/business/model/modelsModel';
  import { getModelByIdApi, getModelDataCountApi } from '/@/api/business/models';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';
  import { SplitedTypeEnum } from '/@/views/datasets/datasetContent/components/data';

  const { t } = useI18n();
  const { createMessage } = useMessage();
  const [registerModal, { changeOkLoading }] = useModalInner(() => {
    handleReset();
    changeOkLoading(false);
  });

  const emits = defineEmits(['run']);
  const props = defineProps<{
    modelType?: string;
    selectName: string; // 下拉框的label
    title: string; // 弹窗 title
    modelId: string | number; // 需要传入 modelId 以获取 classes
    datasetId?: string | number;
    classes?: Array<any>;
  }>();

  const labelCol = { span: 4 };
  const wrapperCol = { span: 24 };

  interface IFormState {
    checkedResult?: boolean;
    checkedData?: boolean;
    sliderValue: [number, number];
    tagsList: any[];
    dataCountRatio: number;
    isExcludeModelData: boolean;
    splitType: string;
    annotationStatus: string;
  }
  const formState = reactive<IFormState>({
    checkedResult: false,
    checkedData: false,
    sliderValue: [0.5, 1],
    tagsList: [],
    dataCountRatio: 100,
    isExcludeModelData: false,
    splitType: '',
    annotationStatus: '',
  });
  const defaultFormState = reactive<IFormState>({
    sliderValue: [0.5, 1],
    tagsList: [],
  });
  // 全选、半选 状态
  const showSelectAll = computed(() => {
    return formState.tagsList.every((item) => item.checked);
  });

  // 执行
  const handleRun = () => {
    // changeOkLoading(true);

    let preModelResults: Nullable<ResultsModelParam> = null;
    let preModelData: Nullable<DataModelParam> = null;

    if (formState.checkedResult) {
      const classes: string[] = [];
      formState.tagsList.forEach((item) => {
        if (item.subClasses) {
          item.subClasses.forEach((child) => {
            child.checked && classes.push(child.code);
          });
        } else {
          item.checked && classes.push(item.code);
        }
      });
      preModelResults = {
        minConfidence: formState.sliderValue[0],
        maxConfidence: formState.sliderValue[1],
        classes: JSON.parse(JSON.stringify(classes)),
      };
    } else {
      // 未勾选状态 -- 全部传
      const classes: string[] = [];
      defaultFormState.tagsList.forEach((item) => {
        if (item.subClasses) {
          item.subClasses.forEach((child) => {
            classes.push(child.code);
          });
        } else {
          classes.push(item.code);
        }
      });
      preModelResults = {
        minConfidence: defaultFormState.sliderValue[0],
        maxConfidence: defaultFormState.sliderValue[1],
        classes: JSON.parse(JSON.stringify(classes)),
      };
    }

    if (formState.checkedData) {
      preModelData = {
        dataCountRatio: formState.dataCountRatio,
        isExcludeModelData: formState.isExcludeModelData,
        splitType: formState.splitType,
        annotationStatus: formState.annotationStatus,
      };
    } else {
      // 未勾选状态 -- 全部传
      preModelData = {
        dataCountRatio: 100,
        isExcludeModelData: false,
      };
    }
    // console.log(preModel);
    // return;
    // 判断 classes
    if (preModelResults.classes.length == 0) {
      createMessage.error(t('business.models.runModel.selectClass'));
      setTimeout(() => {
        changeOkLoading(false);
      }, 500);
      return;
    }
    // 判断data
    if (props.modelType !== 'model' && getDataCount.value == 0) {
      createMessage.error(t('business.models.runModel.noData'));
      setTimeout(() => {
        changeOkLoading(false);
      }, 500);
      return;
    }

    // 抛出数据
    emits('run', preModelResults, preModelData);
  };

  // 类型
  const datasetType = ref<datasetTypeEnum>(datasetTypeEnum.LIDAR_BASIC);
  // 当前获取到的处理之后的 classes
  let classes = reactive<any[]>([]);
  // 获取 Classes
  const getClasses = async () => {
    // 先置空，防止切换 modelId 时数据重复添加
    classes = reactive([]);
    if (props.modelId !== undefined) {
      const res = await getModelByIdApi({ id: props.modelId });
      // 直接处理
      datasetType.value = res.datasetType;
      // 处理数据，添加 checked 属性
      if (res?.classes) {
        classes = res.classes.map((item) => {
          item.checked = true;
          if (item.subClasses) {
            item.subClasses.forEach((child) => {
              child.checked = true;
            });
          }
          return item;
        });
      }
    }
    // 表单值
    formState.tagsList = JSON.parse(JSON.stringify(classes));
    // 初始值
    defaultFormState.tagsList = JSON.parse(JSON.stringify(classes));
  };
  // 监听 modelId 变化，获取 classes
  watch(
    () => props.modelId,
    () => {
      getClasses();
    },
    { immediate: true },
  );
  watch(
    () => props.classes,
    () => {
      getClasses();
    },
    { immediate: true },
  );
  // 切换选择 classes
  const handleToggleSelect = (isCheck: boolean) => {
    // 所有数据的 checked
    formState.tagsList.forEach((item) => {
      item.checked = isCheck;
      if (item.subClasses) {
        item.subClasses.forEach((child) => {
          child.checked = isCheck;
        });
      }
    });
  };

  let dataCount = ref<number>(0);
  watchEffect(async () => {
    let pa: ModelDataCountParams = {
      datasetId: props.datasetId as number,
      modelId: props.modelId as number,
      dataCountRatio: 100,
      isExcludeModelData: formState.isExcludeModelData,
      splitType: formState.splitType,
      annotationStatus: formState.annotationStatus,
    };
    for (const key in pa) {
      if (Object.prototype.hasOwnProperty.call(pa, key)) {
        const element = pa[key];
        if (element === '') {
          delete pa[key];
        }
      }
    }

    if (!props.datasetId) {
      return;
    }
    let res = await getModelDataCountApi(pa);
    dataCount.value = res;
  });

  let getDataCount = computed(() => {
    return ((dataCount.value * formState.dataCountRatio) / 100).toFixed(0);
  });

  // 重置 formState

  const handleReset = () => {
    formState.checkedResult = false;
    formState.checkedData = false;
    formState.sliderValue = [0.5, 1];
    formState.tagsList = JSON.parse(JSON.stringify(classes));

    formState.dataCountRatio = 100;
    formState.isExcludeModelData = false;
    formState.splitType = '';
    formState.annotationStatus = '';
  };
</script>
<style lang="less" scoped>
  .run__body {
    display: flex;
    flex-direction: column;
    margin: 20px 30px 0;

    & > div {
      margin-bottom: 20px;
    }

    .select__btn {
      position: absolute;
      top: -29px;
      left: 60px;

      font-size: 12px;
      line-height: 14px;
      color: #57ccef;
      cursor: pointer;
      user-select: none;
    }

    :deep(.ant-form) {
      .ant-form-item {
        margin-bottom: 16px;
      }
      // .ant-form-item-label {
      //   // padding: 0;
      // }
    }
  }
</style>
<style lang="less">
  .modelRunModal {
    .scroll-container {
      .scrollbar__view {
        max-height: 650px;
      }
    }
  }
</style>
