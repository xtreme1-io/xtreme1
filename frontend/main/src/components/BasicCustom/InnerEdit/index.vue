<template>
  <div class="inner__edit">
    <div v-if="!isEdit" class="inner__edit--value flex items-center gap-20px">
      <span>{{ props.editValue }}</span>
      <div class="flex items-center cursor-pointer">
        <SvgIcon
          style="color: #c4c4c4; cursor: pointer"
          size="24"
          @click="handleEdit"
          name="edit"
        />
      </div>
    </div>
    <div v-if="isEdit" class="inner__edit--input flex items-center gap-10px">
      <div>
        <Form
          name="custom-validation"
          ref="tempValueRef"
          :model="formState"
          :rules="rules"
          labelAlign="left"
          v-bind="layout"
        >
          <Form.Item label="" name="tempValue" :colon="false">
            <Input
              autocomplete="off"
              v-model:value="formState.tempValue"
              type="input"
              allow-clear
              @change="handleInputChange"
              :placeholder="t('business.ontology.createHolder')"
            />
          </Form.Item>
        </Form>
      </div>
      <Button type="default" @click="handleCancelEdit">
        {{ t('common.cancelText') }}
      </Button>
      <Button type="primary" @click="handleSave" :disabled="!isValid">
        {{ t('common.saveText') }}
      </Button>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { nextTick, reactive, ref } from 'vue';
  import { Form, Input } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Button } from '/@@/Button';
  import { SvgIcon } from '/@/components/Icon';
  const { t } = useI18n();

  const props = defineProps<{ editValue: string; validate?: any; id?: string | number }>();
  const emits = defineEmits(['save']);

  const layout = { labelCol: { span: 0 }, wrapperCol: { span: 24 } };
  const formState = reactive<{ tempValue: undefined | string }>({
    tempValue: undefined,
  });

  const rules = {
    tempValue: [
      { validator: props.validate ? props.validate() : null, trigger: '[]' },
      { max: 256, message: t('business.ontology.maxLength') },
    ],
  };

  let tempTimer;
  const tempValueRef = ref();
  const isValid = ref<boolean>(true);
  const handleInputChange = () => {
    clearTimeout(tempTimer);
    tempTimer = setTimeout(async () => {
      const tempValue = formState.tempValue?.trim();
      if (tempValue == props.editValue) {
        tempValueRef.value.clearValidate();
        isValid.value = true;
      } else {
        try {
          await tempValueRef.value.validate();
          isValid.value = true;
        } catch {
          isValid.value = false;
        }
      }
    }, 300);
  };

  /** Edit Name */
  const isEdit = ref<boolean>(false);

  const handleEdit = () => {
    isEdit.value = true;
    formState.tempValue = props.editValue;
  };
  const handleCancelEdit = () => {
    isEdit.value = false;
    formState.tempValue = undefined;
  };
  const handleSave = async () => {
    try {
      if (formState.tempValue != props.editValue) {
        await tempValueRef.value.validate();
        // 派发新值
        emits('save', formState.tempValue);
      }
      nextTick(() => {
        isEdit.value = false;
      });
    } catch {}
  };
</script>
<style lang="less" scoped>
  .inner__edit {
    font-size: 30px;
    line-height: 35px;
    color: #333333;
  }

  .ant-input-affix-wrapper {
    height: auto;
  }

  :deep(.ant-form) {
    width: 100%;

    .ant-form-item {
      width: 100%;
      margin-bottom: 0;
    }

    .ant-input-affix-wrapper {
      .ant-input {
        height: 20px !important;
        font-size: 14px;
      }
    }

    .ant-form-item-explain {
      position: absolute;
    }
  }
</style>
