<template>
  <div :class="`${prefixCls}`">
    <BasicModal
      v-bind="$attrs"
      @register="register"
      class="modal"
      :width="600"
      :title="t('business.datasetContent.splitModel.title')"
      @ok="handleSubmit"
      ok-text="Split"
      :okButtonProps="{
        loading: isLoading,
      }"
      destroy-on-close
      @cancel="cancelModel"
    >
      <div class="content">
        <div class="flex items-center gap-30px">
          <div class="whitespace-nowrap" style="color: #333">Target Data</div>
          <RadioGroup v-model:value="formData.target" button-style="solid">
            <Radio value="">
              {{ t('business.datasetContent.splitModel.All') }}
            </Radio>
            <Radio :value="SplitedTargetDataTypeEnum.SPLIT">
              {{ t('business.datasetContent.splitModel.Splited') }}
            </Radio>
            <Radio :value="SplitedTargetDataTypeEnum.NOT_SPLIT"
              >{{ t('business.datasetContent.splitModel.NotSplited') }}
            </Radio>
          </RadioGroup>
        </div>
        <div class="flex items-center gap-30px">
          <div class="whitespace-nowrap" style="color: #333">Total Data</div>
          <div class="flex items-center" style="width: 100%">
            {{ formData.totalSize.count }}&nbsp;
            <Slider
              :tip-formatter="TotalDataformatter"
              style="width: 100%"
              v-model:value="formData.totalSize.percent"
            />
            {{ formData.totalSize.percent }}%
          </div>
        </div>
        <div class="flex gap-30px">
          <div class="whitespace-nowrap" style="color: #333">Splite Data</div>
          <div class="splite_data" style="width: 100%">
            <div class="mitrics">
              <div class="item" :key="item.key" v-for="item in SplitedSizeList">
                <div class="flex">
                  <span>{{ item.key }} </span> <span>{{ item.percent }}% </span></div
                >
                <div class="count"> {{ item.count }} </div>
              </div></div
            >
            <div :style="`width:${TrainingCountPercent}%`" class="tranSlider"> </div>
            <div :style="`width:${TestCountPercent}%`" class="testSlider"> </div>
            <Slider
              style="width: 100%"
              :tip-formatter="SpliteDataformatter"
              v-model:value="formData.spliteSize"
              range
              :min="0"
              :max="100"
              :step="1"
              @change="handleSliderChange"
            />
          </div>
        </div>
        <div class="flex items-center gap-30px">
          <div class="whitespace-nowrap" style="color: #333">Splitting By</div>
          <RadioGroup v-model:value="formData.splittingBy" button-style="solid">
            <Radio value="RANDOM"> Random </Radio>
            <Radio value="ORDER"> Order </Radio>
          </RadioGroup>
        </div>

        <div v-if="formData.splittingBy === 'ORDER'" class="flex items-center gap-30px ml-105px">
          <div class="whitespace-nowrap" style="color: #333">Order By</div>
          <div>
            <RadioGroup v-model:value="formData.sortBy" button-style="solid">
              <Radio value="CREATE_TIME"> Upload time </Radio>
              <Radio value="NAME"> File name </Radio>
            </RadioGroup>
            <RadioGroup v-model:value="formData.ascOrDesc" button-style="solid">
              <Radio value="ASC"> Asc </Radio>
              <Radio value="DESC"> Desc </Radio>
            </RadioGroup>
          </div>
        </div>
      </div>
    </BasicModal>
  </div>
</template>
<script lang="ts" setup>
  import { defineEmits, reactive, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { setEndTime, setStartTime } from '/@/utils/business/timeFormater';
  import { Form, Checkbox, RadioGroup, Radio, Select, Slider, message } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { Icon } from '/@/components/Icon';
  import { getTotalDataCount, splitDataSelected, splitFliter } from '/@/api/business/dataset';
  import {
    dataTypeEnum,
    splitFliterParams,
    TotalDataCountPa,
  } from '/@/api/business/model/datasetModel';
  import { SplitedTypeEnum, SplitedTargetDataTypeEnum } from './data';
  import { random } from 'lodash';
  const { query } = useRoute();
  const { id } = query;
  const { prefixCls } = useDesign('exportModal');
  const { t } = useI18n();
  const [register, { closeModal }] = useModalInner();
  interface IFormState {
    target: String;
    spliteSize: Array<any>;
    totalSize: any;
    ascOrDesc: string;
    splittingBy: string;
    sortBy: string;
  }
  let formData = reactive<IFormState>({
    target: '',
    totalSize: { maxCount: 0, count: 1000, percent: 100 },
    spliteSize: [80, 90],
    splittingBy: 'RANDOM',
    sortBy: 'CREATE_TIME',
    ascOrDesc: 'ASC',
  });

  let SplitedSizeList = ref([
    { percent: 80, count: 10, key: SplitedTypeEnum.Training },
    { percent: 10, count: 20, key: SplitedTypeEnum.Validation },
    { percent: 10, count: 30, key: SplitedTypeEnum.Test },
  ]);
  watch(
    () => formData.target,
    async (val) => {
      let pa: TotalDataCountPa = {
        datasetId: Number(id),
      };
      val && (pa.targetDataType = val as string);
      let res = await getTotalDataCount(pa);
      formData.totalSize.maxCount = res;
      formData.totalSize.count = res;
      resetSpliteSize();
    },
    { immediate: true, deep: true },
  );
  watch(
    () => formData.totalSize.percent,
    (val) => {
      formData.totalSize.count = ((val * formData.totalSize.maxCount) / 100).toFixed(0);
      resetSpliteSize();
    },
  );
  watch(
    () => formData.spliteSize,
    ([start, end]) => {
      resetSpliteSize();
    },
  );
  const emits = defineEmits(['fetchList', 'closeSpliteModel']);
  const cancelModel = () => {
    emits('closeSpliteModel');
  };
  let TrainingCountPercent = ref(80);
  let TestCountPercent = ref(10);
  let resetSpliteSize = () => {
    let [start, end] = formData.spliteSize;
    let TrainingCount = ((formData.totalSize.count * start) / 100).toFixed(0);
    let ValidationCount = ((formData.totalSize.count * (end - start)) / 100).toFixed(0);
    let TestCount = formData.totalSize.count - TrainingCount - ValidationCount;

    TrainingCountPercent.value = start;

    TestCountPercent.value = 100 - end;
    SplitedSizeList.value = [
      { percent: start, count: TrainingCount, key: SplitedTypeEnum.Training },
      { percent: end - start, count: ValidationCount, key: SplitedTypeEnum.Validation },
      { percent: 100 - end, count: TestCount, key: SplitedTypeEnum.Test },
    ];
  };

  const TotalDataformatter = (value: number) => {
    return `${value}%`;
  };
  const SpliteDataformatter = (value: number) => {
    return `${value}%`;
  };

  const isLoading = ref<boolean>(false);
  const handleSubmit = async () => {
    let params: splitFliterParams = {
      datasetId: Number(id),
      totalSizeRatio: formData.totalSize.percent,
      trainingRatio:
        SplitedSizeList.value.find((i) => i.key == SplitedTypeEnum.Training)?.percent || 0,
      validationRatio:
        SplitedSizeList.value.find((i) => i.key == SplitedTypeEnum.Validation)?.percent || 0,
      testRatio: SplitedSizeList.value.find((i) => i.key == SplitedTypeEnum.Test)?.percent || 0,
      splittingBy: formData.splittingBy,
    };
    formData.target && (params.targetDataType = formData.target as string);
    if (formData.splittingBy == 'ORDER') {
      params.sortBy = formData.sortBy;
      params.ascOrDesc = formData.ascOrDesc;
    }
    try {
      isLoading.value = true;
      const res = await splitFliter(params);
      emits('fetchList');
      message.success({
        content: 'successed',
        duration: 5,
      });

      closeModal();
      emits('closeSpliteModel');
    } catch (e) {}

    setTimeout(() => {
      isLoading.value = false;
    }, 300);
  };
</script>
<style lang="less" scoped>
  .content {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 40px 50px;
    font-size: 14px;
    line-height: 16px;
    .splite_data {
      position: relative;
      .tranSlider {
        left: 0;
        bottom: 12px;
        position: absolute;
        height: 3px;
        width: 50px;
        background: #32d583;
        z-index: 9999;
      }
      .testSlider {
        right: -12px;
        bottom: 12px;
        position: absolute;
        height: 3px;
        width: 50px;
        background: #fdb022;
        z-index: 9999;
      }

      .mitrics {
        display: flex;
        width: 100%;
        margin-bottom: 20px;
        vertical-align: top;
        .item {
          width: 33.3%;
          height: 70px;
          border: 1px solid #aaa;
          background: #f3f4f6;
          padding: 12px;
          .flex {
            width: 100%;
            justify-content: space-between;
          }
          .count {
            margin-top: 12px;
          }
        }
        :deep(.ant-slider).ant-slider-track {
          background: #3e8be9;
        }
      }
    }
  }
</style>
