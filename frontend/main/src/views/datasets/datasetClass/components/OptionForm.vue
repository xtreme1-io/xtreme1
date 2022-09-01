<template>
  <div class="basic-form">
    <div class="back">
      <Icon
        @click="handleCancel"
        style="cursor: pointer; color: #cccccc"
        icon="ic:outline-arrow-back"
      />
      <!-- <span class="name">{{ data.name }}</span> -->
    </div>
    <BasicForm @register="registerForm" :showActionButtonGroup="false" />
    <Divider style="margin: 10px 0" />
    <OptionEditor
      :dataSchema="data"
      type="attributes"
      :handleSet="handleSet"
      :handleAddIndex="handleAddIndex"
    />
  </div>
</template>
<script lang="ts" setup>
  import { unref, onMounted } from 'vue';
  import Icon from '/@/components/Icon';
  import { Divider } from 'ant-design-vue';
  import emitter from 'tiny-emitter/instance';
  // import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicForm, useForm } from '/@/components/Form';
  import { optionBase } from './formSchemas';
  import OptionEditor from './OptionEditor.vue';
  import { dataProps } from './typing';
  import { getSchema, handleMutiTabAction, setClassSchema, setSchema } from './utils';
  // const { t } = useI18n();
  const [registerForm, { setFieldsValue, getFieldsValue }] = useForm({
    schemas: optionBase,
  });
  const props = defineProps(dataProps);
  const data = getSchema(props.dataSchema, props.indexList);
  const { handleSet, handleAddIndex, handleRemoveIndex } = unref(props);
  const handleCancel = () => {
    handleRemoveIndex && handleRemoveIndex();
  };
  emitter.off('handleSaveForm');
  emitter.once('handleSaveForm', function () {
    handleMutiTabAction(
      props.activeTab,
      () => {
        setClassSchema(props.dataSchema, props.indexList, {
          setType: 'update',
          setValue: getFieldsValue() as any,
        });
      },
      () => {
        setSchema(props.dataSchema, props.indexList, {
          setType: 'update',
          setValue: getFieldsValue() as any,
        });
      },
    );
  });
  onMounted(() => {
    setFieldsValue({
      ...data,
    });
  });
</script>
<style lang="less" scoped>
  @import url(./index.less);
</style>
