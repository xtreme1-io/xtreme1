<template>
  <div :class="`${prefixCls}`">
    <Form
      ref="formRef"
      :model="formState"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
      hideRequiredMark
      labelAlign="left"
    >
      <!-- <Form.Item>
        <Input
          autocomplete="off"
          v-model:value="formState.name"
          :placeholder="t('business.ontology.searchForm.searchItems')"
        >
          <template #suffix>
            <Icon icon="ant-design:search-outlined" style="color: #aaa" size="16" />
          </template>
        </Input>
      </Form.Item> -->
      <Form.Item
        :label="t('business.ontology.searchForm.sort')"
        name="Sort"
        :labelCol="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <Select style="flex: 1" size="small" v-model:value="formState.sortBy">
          <Select.Option v-for="item in dataSortOption" :key="item.value" :value="item.value">
            {{ item.label }}
          </Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name="Sort">
        <Radio.Group name="radioGroup" v-model:value="formState.ascOrDesc">
          <Radio v-for="item in SortTypeOption" :key="item.label" :value="item.value">
            <span>{{ item.label }}</span>
          </Radio>
        </Radio.Group>
      </Form.Item>
      <div class="font-bold mb-2 flex justify-between">
        <div class="label-text">{{ t('business.ontology.searchForm.filter') }}</div>
        <div>
          <SvgIcon @click="resetFilter" name="reload" />
        </div>
      </div>
      <Form.Item>
        <CollContainer
          icon="mdi:calendar-month"
          :title="t('business.ontology.searchForm.createdDate')"
        >
          <DatePicker v-model:start="formState.startTime" v-model:end="formState.endTime" />
        </CollContainer>
      </Form.Item>
      <Form.Item v-if="props.activeTab == ClassTypeEnum.CLASS">
        <CollContainer icon="fa-solid:toolbox" :title="t('business.ontology.searchForm.toolType')">
          <div class="select-inner w-full">
            <Select
              size="small"
              v-model:value="formState.toolType"
              :placeholder="t('business.ontology.searchForm.search')"
              allowClear
            >
              <Select.Option v-for="item in toolTypeOption" :key="item.type" :value="item.type">
                <div class="img-tool flex flex-row items-center leading-24px">
                  <img :src="item.img" class="mr-10px w-16px h-16px" />
                  <span>{{ item.text }}</span>
                </div>
              </Select.Option>
            </Select>
          </div>
        </CollContainer>
      </Form.Item>
      <Form.Item v-if="props.activeTab == ClassTypeEnum.CLASSIFICATION">
        <CollContainer icon="lucide:form-input" :title="t('business.class.inputType')">
          <div class="select-inner w-full">
            <Select
              size="small"
              v-model:value="formState.inputType"
              :placeholder="t('business.ontology.searchForm.search')"
              allowClear
            >
              <Select.Option v-for="item in inputTypeList" :key="item.key" :value="item.value">
                <div class="img-tool flex flex-row items-center leading-24px">
                  <img :src="item.img" class="mr-10px w-16px h-16px" />
                  <span>{{ item.label }}</span>
                </div>
              </Select.Option>
            </Select>
          </div>
        </CollContainer>
      </Form.Item>
    </Form>
  </div>
</template>
<script lang="ts" setup>
  import { reactive, computed, watch, defineExpose } from 'vue';
  import { Form, Input, Select, Radio } from 'ant-design-vue';
  import CollContainer from '/@@/CollContainer/index.vue';
  import DatePicker from '/@@/DatePicker/index.vue';
  import Icon, { SvgIcon } from '/@/components/Icon';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { setEndTime, setStartTime } from '/@/utils/business/timeFormater';
  import { SortTypeEnum } from '/@/api/model/baseModel';
  import {
    SearchItem,
    ClassTypeEnum,
    ToolTypeEnum,
    SortFieldEnum,
  } from '/@/api/business/model/classesModel';
  import type { Dayjs } from 'dayjs';
  import { dataSortOption, SortTypeOption, toolTypeList, inputTypeList } from '../attributes/data';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';

  const { t } = useI18n();
  const { prefixCls } = useDesign('searchForm');

  const props = withDefaults(
    defineProps<{
      isCenter?: boolean;
      activeTab: ClassTypeEnum;
      datasetType: datasetTypeEnum;
      searchName?: string;
    }>(),
    {
      isCenter: true,
    },
  );

  const emits = defineEmits(['search']);

  let formState: SearchItem = reactive({
    name: undefined,
    sortBy: SortFieldEnum.CREATE_TIME,
    ascOrDesc: SortTypeEnum.ASC,
    startTime: undefined,
    endTime: undefined,
    toolType: undefined,
    inputType: undefined,
  });
  const labelCol = { span: 0 };
  const wrapperCol = { span: 24 };

  const formValue = computed((): SearchItem => {
    return {
      name: formState.name,
      sortBy: formState.sortBy,
      ascOrDesc: formState.ascOrDesc,
      startTime: formState.startTime ? setStartTime(formState.startTime as Dayjs) : undefined,
      endTime: formState.endTime ? setEndTime(formState.endTime as Dayjs) : undefined,
      toolType: formState.toolType,
      inputType: formState.inputType,
    };
  });

  let timeout;
  watch(formState, () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      emits('search', formValue);
    }, 400);
  });
  watch(
    () => props.searchName,
    (val) => {
      // debugger
      formState.name = val;
    },
  );
  /**  ToolType Selection List */
  const toolTypeOption = computed(() => {
    if (props.datasetType != datasetTypeEnum.IMAGE) {
      return toolTypeList.filter((item) => item.type === ToolTypeEnum.CUBOID);
    } else {
      return toolTypeList.filter((item) => item.type !== ToolTypeEnum.CUBOID);
    }
  });

  const resetFilter = () => {
    formState.name = undefined;
    formState.sortBy = SortFieldEnum.CREATE_TIME;
    formState.ascOrDesc = SortTypeEnum.ASC;
    formState.startTime = undefined;
    formState.endTime = undefined;
    formState.toolType = undefined;
    formState.inputType = undefined;
  };

  defineExpose({ formValue });
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-searchForm';
  .@{prefix-cls} {
    width: 100%;
    height: 100%;
    border: 1px solid #ccc;
    padding: 12px;
    background-color: #fff;
    color: #333;

    &:deep(.ant-radio-group) {
      display: flex;
      justify-content: space-between;

      .ant-radio-wrapper {
        height: 24px;
        font-size: 12px;
        color: #333;
      }
    }

    .select-inner {
      padding: 10px 0;
    }

    .ant-form-item {
      margin-bottom: 10px;
    }

    .label-text {
      font-weight: 500; //font-weight: 600;

      font-size: 16px;
      line-height: 19px;
      color: #333;
      margin-bottom: 10px;
    }

    :deep(.ant-form-item-label) {
      label {
        font-weight: 500; //font-weight: 600;

        font-size: 16px;
        line-height: 19px;
        color: #333;
      }
    }
  }
</style>
