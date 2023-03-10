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
    >
      <div class="content">
        <div class="flex items-center gap-30px">
          <div class="whitespace-nowrap" style="color: #333">Target Data</div>
          <RadioGroup v-model:value="formData.target" button-style="solid">
            <Radio value="All">
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
          <div class="whitespace-nowrap" style="color: #333"
            >Total Data {{ formData.totalSize.count }}</div
          >

          <Slider
            :tip-formatter="TotalDataformatter"
            style="width: 100%"
            v-model:value="formData.totalSize.percent"
          />
          {{ formData.totalSize.percent }}%
        </div>
        <div class="flex items-center gap-30px">
          <div class="whitespace-nowrap" style="color: #333">Splite Data</div>
          <div style="width: 100%">
            <div class="mitrics">
              <div class="item" :key="item.key" v-for="item in SplitedSizeList">
                {{ item.key }} {{ item.percent }}%
                <div> {{ item.count }} </div>
              </div></div
            >
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

        <div class="flex items-center gap-30px">
          <div class="whitespace-nowrap" style="color: #333">Order By</div>
          <RadioGroup v-model:value="formData.sortBy" button-style="solid">
            <Radio value="CREATE_TIME"> Upload time </Radio>
            <Radio value="NAME"> File name </Radio>
          </RadioGroup>
        </div>
        <div class="flex items-center gap-100px">
          <div class="whitespace-nowrap" style="color: #333"> </div>
          <RadioGroup v-model:value="formData.ascOrDesc" button-style="solid">
            <Radio value="ASC"> Asc </Radio>
            <Radio value="DESC"> Desc </Radio>
          </RadioGroup>
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
  import { Form, Checkbox, RadioGroup, Radio, Select, Slider } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { Icon } from '/@/components/Icon';
  import { splitFliter } from '/@/api/business/dataset';
  import { dataTypeEnum } from '/@/api/business/model/datasetModel';
  import { SplitedTypeEnum, SplitedTargetDataTypeEnum } from './data';
  import { random } from 'lodash';

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
    totalSize: { maxCount: 1000, count: 1000, percent: 100 },
    spliteSize: [80, 90],
    splittingBy: '',
    sortBy: '',
    ascOrDesc: '',
  });

  let SplitedSizeList = ref([
    { percent: 80, count: 10, key: SplitedTypeEnum.Training },
    { percent: 10, count: 20, key: SplitedTypeEnum.Validation },
    { percent: 10, count: 30, key: SplitedTypeEnum.Test },
  ]);
  watch(
    () => formData.totalSize.percent,
    (val) => {
      formData.totalSize.count = Math.floor((val * formData.totalSize.maxCount) / 100);
      resetSpliteSize();
    },
  );
  watch(
    () => formData.spliteSize,
    ([start, end]) => {
      resetSpliteSize();
    },
  );

  let resetSpliteSize = () => {
    let [start, end] = formData.spliteSize;
    let TrainingCount = Math.floor((formData.totalSize.count * start) / 100);
    let ValidationCount = Math.floor((formData.totalSize.count * (end - start)) / 100);
    let TestCount = formData.totalSize.count - TrainingCount - ValidationCount;
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

  let handleSliderChange = () => {};
  const { query } = useRoute();
  const { id } = query;
  const { prefixCls } = useDesign('exportModal');
  const { t } = useI18n();
  const [register, { closeModal }] = useModalInner();

  const props = defineProps<{ filterForm: any }>();
  const emit = defineEmits(['setExportRecord']);

  const selectValue = ref<string>('');
  const selectOption = [
    {
      value: 'Xtreme1 v0.5.5',
      label: 'Xtreme1 v0.5.5',
    },
  ];

  const isLoading = ref<boolean>(false);
  const handleSubmit = async () => {
    let data = {
      datasetId: id,
      targetDataType: formData.target,
      totalSizeRatio: formData.totalSize.percent,
      trainingRatio: SplitedSizeList.value.find((i) => i.key == SplitedTypeEnum.Training)?.percent,
      validationRatio: SplitedSizeList.value.find((i) => i.key == SplitedTypeEnum.Validation)
        ?.percent,
      testRatio: SplitedSizeList.value.find((i) => i.key == SplitedTypeEnum.Test)?.percent,
      splittingBy: formData.splittingBy,
      sortBy: formData.sortBy,
      ascOrDesc: formData.ascOrDesc,
    };
    try {
      isLoading.value = true;
      const res = await splitFliter(data);
      // emit('setExportRecord', res);
      closeModal();
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
    .mitrics {
      display: flex;
      width: 100%;
      .item {
        width: 33.3%;
        height: 50px;
        border: 1px solid #aaa;
      }
    }
  }
</style>
