import { reactive } from 'vue';
import { FormSchema } from '/@/components/Form/index';
import { useI18n } from '/@/hooks/web/useI18n';
import { Form, Input } from 'ant-design-vue';
import Button from '/@@/Button/index.vue';
import PwdLabelInfo from './components/PwdLabelInfo.vue';
import { ButtonSize } from '/@/components/BasicCustom/Button/typing';
import { validatePassword } from '/@/utils/validator';
const { t } = useI18n();
const formState = reactive({
  newPassword: '',
  confirmPassword: '',
});
export interface ListItem {
  key: string;
  title: string;
  description: string;
  extra?: string;
  avatar?: string;
  color?: string;
}

export const getBaseSetSchemas = (handleChangeState): FormSchema[] => {
  return [
    {
      field: 'nickname',
      component: 'Input',
      label: t('common.nameText'),
      rules: [{ required: true }],
      componentProps: { size: 'large' },
    },
    {
      field: 'email',
      component: 'Input',
      label: t('sys.login.email'),
      componentProps: { size: 'large', disabled: true },
    },
    {
      field: 'password',
      component: 'InputPassword',
      label: t('sys.login.password'),
      renderColContent: () => (
        <Form.Item>
          <PwdLabelInfo />
          <Button
            type="default"
            size={ButtonSize.LG}
            onClick={() => {
              handleChangeState(true);
            }}
          >
            {t('business.profile.changePassword')}
          </Button>
        </Form.Item>
      ),
    },
  ];
};

export const getTransSetSchemas = (hasPwd: boolean): FormSchema[] => {
  return [
    {
      field: 'nickname',
      component: 'Input',
      label: t('common.nameText'),
      rules: [{ required: true }],
      componentProps: { size: 'large' },
    },
    {
      field: 'email',
      component: 'Input',
      label: t('sys.login.email'),
      componentProps: { size: 'large', disabled: true },
    },
    {
      field: 'password',
      component: 'InputPassword',
      label: t('sys.login.password'),
      rules: [{ required: true }],
      renderColContent: ({ model }) => (
        <Form.Item>
          <PwdLabelInfo />
          {hasPwd && (
            <Form.Item
              name="password"
              rules={[
                {
                  validator: validatePassword,
                  trigger: 'change',
                },
              ]}
            >
              <Input
                name="new-password"
                autocomplete="new-password"
                size="large"
                type="password"
                placeholder={t('business.profile.oldPasswordPlaceholder')}
                onChange={(e) => {
                  model.password = e.target.value;
                }}
              ></Input>
            </Form.Item>
          )}
          <Form.Item name="newPassword">
            <Input
              name="bbbb"
              autocomplete="off"
              size="large"
              type="password"
              placeholder={t('business.profile.newPasswordPlaceholder')}
              v-model:value={formState.newPassword}
              onChange={(e) => {
                model.newPassword = e.target.value;
              }}
            ></Input>
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            rules={[
              {
                validator: async () => {
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
            ]}
          >
            <Input
              name="ccc"
              autocomplete="new-password"
              size="large"
              type="password"
              placeholder={t('business.profile.confirmPasswordPlaceholder')}
              v-model:value={formState.confirmPassword}
              onChange={(e) => {
                model.confirmPassword = e.target.value;
              }}
            ></Input>
          </Form.Item>
        </Form.Item>
      ),
    },
    {
      field: 'newPassword',
      component: 'InputPassword',
      label: t('sys.login.password'),
      ifShow: false,
      colProps: { span: 18 },
    },
    {
      field: 'confirmPassword',
      component: 'InputPassword',
      label: t('sys.login.password'),
      ifShow: false,
      colProps: { span: 18 },
    },
  ];
};

export const baseSetschemas: FormSchema[] = [
  {
    field: 'name',
    component: 'Input',
    label: t('common.nameText'),
    colProps: { span: 18 },
  },
  {
    field: 'email',
    component: 'Input',
    label: t('sys.login.email'),
    colProps: { span: 18 },
  },
  {
    field: 'password',
    component: 'InputPassword',
    label: t('sys.login.password'),
    colProps: { span: 18 },
    renderColContent: () => (
      <Form.Item label={t('sys.login.password')}>
        <Button type="default" size={ButtonSize.LG}>
          Change Password
        </Button>
      </Form.Item>
    ),
  },
];
