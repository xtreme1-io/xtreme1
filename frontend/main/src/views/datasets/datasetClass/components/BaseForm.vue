<template>
  <div class="basic-form">
    <div class="basic-form-tab">
      <div
        v-if="!props.detail || (props.detail && props.detail.type === ClassTypeEnum.CLASS)"
        :class="`basic-form-tab-item ${props.activeTab === ClassTypeEnum.CLASS ? 'active' : null}`"
        @click="
          () => {
            handleChangeTab && handleChangeTab(ClassTypeEnum.CLASS);
          }
        "
      >
        {{ t('business.class.class') }}
      </div>
      <div
        v-if="!props.detail || (props.detail && props.detail.type === ClassTypeEnum.CLASSIFICATION)"
        :class="`basic-form-tab-item ${
          props.activeTab === ClassTypeEnum.CLASSIFICATION ? 'active' : null
        }`"
        @click="
          () => {
            handleChangeTab && handleChangeTab(ClassTypeEnum.CLASSIFICATION);
          }
        "
      >
        {{ t('business.class.classification') }}
      </div>
    </div>
    <BasicForm
      v-if="props.activeTab === ClassTypeEnum.CLASS"
      @register="registerClassForm"
      :showActionButtonGroup="false"
    >
      <template #colorSlot>
        <div @click="handleColor">
          <Input
            autocomplete="off"
            style="background: white; color: #333; cursor: pointer"
            disabled
            v-model:value="colorOptions.value"
          />
        </div>
      </template>
      <template #toolType="{ model, field }">
        <Radio.Group class="img-radio" v-model:value="model[field]">
          <Radio v-for="item in optionList" :key="item.id" :value="item.type">
            <div class="img-tool">
              <img :src="item.img" alt="" />
            </div>
          </Radio>
        </Radio.Group>
      </template>
      <template #cuboidSetting="{ model, field }">
        <Row align="middle" :gutter="[0, 16]">
          <Col :span="16">
            <span class="text-xs">Default Height:</span>
          </Col>
          <Col :span="8">
            <Input autocomplete="off" size="small" v-model:value="model[field]['defaultHeight']" />
          </Col>
        </Row>
        <Row align="middle">
          <Col :span="16">
            <span class="text-xs">Min Height:</span>
          </Col>
          <Col :span="8">
            <Input autocomplete="off" size="small" v-model:value="model[field]['minHeight']" />
          </Col>
        </Row>
        <Row align="middle">
          <Col :span="16">
            <span class="text-xs">Min Points:</span>
          </Col>
          <Col :span="8">
            <Input autocomplete="off" size="small" v-model:value="model[field]['minPoints']" />
          </Col>
        </Row>
      </template>
    </BasicForm>
    <BasicForm v-else @register="registerForm" :showActionButtonGroup="false" />
    <Divider style="margin: 10px 0" />
    <OptionEditor
      v-if="isShow"
      :type="editorType"
      :dataSchema="props.dataSchema"
      :handleSet="handleSet"
      :handleAddIndex="handleAddIndex"
    />
  </div>
</template>
<script lang="ts" setup>
  import { ref, unref, computed, defineEmits, onMounted, inject, Ref } from 'vue';
  import { Divider, Input, Radio, Row, Col } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicForm, useForm } from '/@/components/Form';
  import { classificationBase, classBase, toolTypeList, toolTypeList3D } from './formSchemas';
  import { colorEvent } from 'v3-color-picker';
  import OptionEditor from './OptionEditor.vue';
  import { dataProps, inputType } from './typing';
  import { ClassTypeEnum } from '/@/api/business/model/classModel';
  import emitter from 'tiny-emitter/instance';
  import { DatasetListItem, datasetTypeEnum } from '/@/api/business/model/datasetModel';
  const info = inject('datasetItem') as Ref<DatasetListItem>;
  const isImg = computed(() => {
    return info?.value?.type === datasetTypeEnum.IMAGE;
  });
  const optionList = computed(() => {
    if (isImg.value) {
      return toolTypeList;
    }
    return toolTypeList3D;
  });
  const handleChangeType = (val) => {
    if (val === inputType.Text) {
      isShow.value = false;
    } else {
      isShow.value = true;
    }
  };

  const [registerClassForm, { getFieldsValue: getClassVal, setFieldsValue: setClassVal }] = useForm(
    {
      schemas: classBase(!isImg.value),
    },
  );
  const [
    registerForm,
    { getFieldsValue: getClassificationVal, setFieldsValue: setClassificationVal },
  ] = useForm({
    schemas: classificationBase(handleChangeType),
  });
  const isShow = ref<boolean>(true);

  const { t } = useI18n();
  const colorOptions = ref({
    value: '#57CCEF',
    btn: true,
    theme: 'light',
    zIndex: 1000,
  });
  const handleColor = (event) => {
    colorEvent(event, colorOptions.value as any);
    event.preventDefault();
  };

  const props = defineProps(dataProps);
  onMounted(() => {
    if (props.detail) {
      if (props.activeTab === ClassTypeEnum.CLASS) {
        setClassVal({
          ...props.detail,
          cuboidProperties: JSON.parse(props.detail.cuboidProperties),
        });
      } else {
        setClassificationVal({ ...props.detail });
      }
    }
  });
  const { handleSet, handleAddIndex, handleChangeTab } = unref(props);
  const editorType = computed(() => {
    return props.activeTab === ClassTypeEnum.CLASS ? 'attributes' : 'options';
  });
  const emits = defineEmits(['handleSubmit']);
  const handleSubmit = () => {
    const data =
      props.activeTab === ClassTypeEnum.CLASS
        ? { ...getClassVal(), color: colorOptions.value.value }
        : getClassificationVal();
    emits('handleSubmit', data);
  };
  emitter.off('handleSubmitForm');
  emitter.once('handleSubmitForm', function () {
    handleSubmit();
  });
</script>
<style lang="less" scoped>
  @import url(./index.less);
</style>
