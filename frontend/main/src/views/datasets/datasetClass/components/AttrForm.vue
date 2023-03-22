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
      v-if="isShow"
      :dataSchema="data"
      type="options"
      :handleSet="handleSet"
      :handleAddIndex="handleAddIndex"
    />
  </div>
</template>
<script lang="ts" setup>
  import { unref, onMounted, ref } from 'vue';
  import { Divider } from 'ant-design-vue';
  // import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicForm, useForm } from '/@/components/Form';
  import emitter from 'tiny-emitter/instance';
  import Icon from '/@/components/Icon';
  import { attributeBase } from './formSchemas';
  import OptionEditor from './OptionEditor.vue';
  import { dataProps, inputType } from './typing';
  import { getSchema, handleMutiTabAction, setClassSchema, setSchema } from './utils';
  // const { t } = useI18n();
  const isShow = ref<boolean>(true);
  const handleChangeType = (val) => {
    if (val === inputType.Text) {
      isShow.value = false;
    } else {
      isShow.value = true;
    }
  };
  const [registerForm, { setFieldsValue, getFieldsValue }] = useForm({
    schemas: attributeBase(handleChangeType),
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
    handleChangeType(data.type);
    setFieldsValue({
      ...data,
    });
  });
</script>
<style lang="less" scoped>
  @import url(./index.less);
</style>
