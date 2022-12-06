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
        <Form.Item>
          <Checkbox v-model:checked="formState.checked">
            {{ t('business.models.runModel.predict') }}
          </Checkbox>
        </Form.Item>
        <div v-show="!formState.checked">
          <Form.Item :label="t('business.models.runModel.confidence')">
            <TheSlider
              v-model:start="formState.sliderValue[0]"
              v-model:end="formState.sliderValue[1]"
            />
          </Form.Item>
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
        </div>
      </Form>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, reactive, computed, watch } from 'vue';
  // 组件
  import { useMessage } from '/@/hooks/web/useMessage';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { Form, Checkbox } from 'ant-design-vue';
  import TheSlider from './TheSlider.vue';
  import TheTags from './TheTags.vue';
  // 工具
  import { useI18n } from '/@/hooks/web/useI18n';
  // 接口
  import { PreModelParam } from '/@/api/business/model/modelsModel';
  import { getModelByIdApi } from '/@/api/business/models';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';

  const { t } = useI18n();
  const { createMessage } = useMessage();
  const [registerModal, { changeOkLoading }] = useModalInner(() => {
    handleReset();
    changeOkLoading(false);
  });

  const emits = defineEmits(['run']);
  const props = defineProps<{
    selectName: string; // 下拉框的label
    title: string; // 弹窗 title
    modelId: string | number; // 需要传入 modelId 以获取 classes
  }>();

  const labelCol = { span: 4 };
  const wrapperCol = { span: 14 };

  interface IFormState {
    checked?: boolean;
    sliderValue: [number, number];
    tagsList: any[];
  }
  const formState = reactive<IFormState>({
    checked: true,
    sliderValue: [0.5, 1],
    tagsList: [],
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
    changeOkLoading(true);

    let preModel: Nullable<PreModelParam> = null;

    if (!formState.checked) {
      // 勾选状态 -- 传勾选的
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
      preModel = {
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
      preModel = {
        minConfidence: defaultFormState.sliderValue[0],
        maxConfidence: defaultFormState.sliderValue[1],
        classes: JSON.parse(JSON.stringify(classes)),
      };
    }
    // console.log(preModel);
    // return;
    // 判断 classes
    if (preModel.classes.length == 0) {
      createMessage.error(t('business.models.runModel.selectClass'));
      setTimeout(() => {
        changeOkLoading(false);
      }, 500);
      return;
    }
    // 抛出数据
    emits('run', preModel);
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

  // 重置 formState
  const handleReset = () => {
    formState.checked = true;
    formState.sliderValue = [0.5, 1];
    formState.tagsList = JSON.parse(JSON.stringify(classes));
  };
</script>
<style lang="less" scoped>
  .run__body {
    display: flex;
    flex-direction: column;
    margin: 20px 60px 0;
    margin-left: 86px;

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
        max-height: 400px;
      }
    }
  }
</style>
