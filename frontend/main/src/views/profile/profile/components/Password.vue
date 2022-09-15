<template>
  <div :class="`${prefixCls}`">
    <div class="header">
      <div>{{ t('sys.login.password') }}</div>
      <PwdTooltip />
    </div>
    <div class="form">
      <Form name="custom-validation" ref="formRef" :model="formState" :rules="rules">
        <div v-if="!showChangePassword">
          <Button type="default" @click="showChangePassword = !showChangePassword">
            {{ t('business.profile.changePassword') }}
          </Button>
        </div>
        <div v-else>
          <Form.Item v-if="props.hasPassword" name="password">
            <Input
              name="new-password"
              autocomplete="new-password"
              size="large"
              type="password"
              :placeholder="t('business.profile.oldPasswordPlaceholder')"
              @change="
                (e) => {
                  formState.password = e.target.value;
                }
              "
            />
          </Form.Item>
          <Form.Item name="newPassword">
            <Input
              name="bbbb"
              autocomplete="off"
              size="large"
              type="password"
              :placeholder="t('business.profile.newPasswordPlaceholder')"
              v-model:value="formState.newPassword"
              @change="
                (e) => {
                  formState.newPassword = e.target.value;
                }
              "
            />
          </Form.Item>
          <Form.Item name="confirmPassword">
            <Input
              name="ccc"
              autocomplete="new-password"
              size="large"
              type="password"
              :placeholder="t('business.profile.confirmPasswordPlaceholder')"
              v-model:value="formState.confirmPassword"
              @change="
                (e) => {
                  formState.confirmPassword = e.target.value;
                }
              "
            />
          </Form.Item>
          <div className="flex gap-10px justify-end">
            <Button type="default" @click="handleCancel"> Cancel </Button>
            <Button type="primary" disable="true" @click="handleSavePassword"> Save </Button>
          </div>
        </div>
      </Form>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { validatePassword } from '/@/utils/validator';

  import { Form, Input } from 'ant-design-vue';
  import Button from '/@@/Button/index.vue';
  import { PwdTooltip } from '/@@/PwdTooltip';

  const { t } = useI18n();
  const { createMessage } = useMessage();
  const { prefixCls } = useDesign('pwd-label');

  const props = defineProps<{ hasPassword: boolean }>();
  const emits = defineEmits(['submit']);

  const formRef = ref();
  const formState = reactive<any>({
    password: undefined,
    newPassword: undefined,
    confirmPassword: undefined,
  });
  const rules = {
    password: [
      { required: true, validator: validatePassword, trigger: 'change' },
      { max: 255, message: t('business.ontology.maxLength') },
    ],
    confirmPassword: [
      {
        validator: () => {
          if (!formState.confirmPassword) {
            return Promise.reject(t('sys.login.passwordPlaceholder'));
          }
          if (formState.confirmPassword != formState.newPassword) {
            return Promise.reject(t('sys.login.diffPwd'));
          } else {
            return Promise.resolve();
          }
        },
      },
      { max: 255, message: t('business.ontology.maxLength') },
    ],
  };

  const showChangePassword = ref<boolean>(false);
  const handleCancel = () => {
    showChangePassword.value = false;
    formState.password = undefined;
    formState.newPassword = undefined;
    formState.confirmPassword = undefined;
  };
  const handleSavePassword = async () => {
    try {
      const data = await formRef.value.validate();

      if (data.confirmPassword !== data.newPassword) {
        console.log(data);
        return createMessage.error('The two passwords entered are different');
      }

      delete data.confirmPassword;

      emits('submit', data);
    } catch (error) {}
  };

  defineExpose({
    handleCancel,
  });
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-pwd-label';
  .@{prefix-cls} {
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;

      font-weight: 500;
      font-size: 16px;
      line-height: 19px;
      color: #333;

      .info-icon {
        color: #ccc;
      }
    }

    .form {
      :deep(.ant-form) {
        .ant-form-item-control-input-content {
          .ant-input {
            height: 36px;
            border-radius: 4px;
            line-height: 36px;
          }

          .ant-btn-default {
            height: 36px;
            padding: 0px 10px !important;
            border-color: #60a9fe !important;
            border-radius: 8px !important;
            font-size: 14px !important;
            line-height: 16px !important;
            color: #60a9fe !important;
          }

          .ant-btn-primary {
            height: 36px;
            padding: 0px 10px !important;
            border-color: #60a9fe !important;
            border-radius: 8px !important;
            font-size: 14px !important;
            line-height: 16px !important;
          }
        }
      }
    }
  }
</style>
