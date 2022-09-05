import type { ValidationRule } from 'ant-design-vue/lib/form/Form';
import type { RuleObject } from 'ant-design-vue/lib/form/interface';
import { ref, computed, unref, Ref } from 'vue';
import { useI18n } from '/@/hooks/web/useI18n';
import { emailReg } from '/@/utils/business/regexp';
import { validatePassword } from '/@/utils/validator';

export enum LoginStateEnum {
  LOGIN,
  REGISTER,
  RESET_PASSWORD,
  FORGET_PASSWORD,
  RESET_SUCCESS,
  TEAM_BRIDGE,
  JOIN_TEAM,
  CREATE_TEAM,
  JOIN_TEAM_CONFIRM,
  JOIN_TEAM_FEED,
  CREATE_TEAM_FEED,
  SIGNUP_FEED,
}

const currentState = ref(LoginStateEnum.LOGIN);
const loginErrorState = ref(false);

export function useLoginState() {
  function setLoginState(state: LoginStateEnum) {
    currentState.value = state;
  }

  const getLoginState = computed(() => currentState.value);

  function setLoginErrorState(state: boolean) {
    loginErrorState.value = state;
  }

  const getLoginErrorState = computed(() => loginErrorState.value);

  function handleBackLogin() {
    setLoginState(LoginStateEnum.LOGIN);
  }

  return { setLoginState, getLoginState, handleBackLogin, setLoginErrorState, getLoginErrorState };
}

export function useFormValid<T extends Object = any>(formRef: Ref<any>) {
  async function validForm() {
    const form = unref(formRef);
    if (!form) return;
    const data = await form.validate();
    return data as T;
  }

  return { validForm };
}

export function useFormRules(formData?: Recordable) {
  const { t } = useI18n();

  const getAccountFormRule = computed(() => createRule(t('sys.login.accountPlaceholder')));
  const getEmailFormRule = computed(() => createRule(t('sys.login.emailPlaceholder')));
  const getPasswordFormRule = computed(() => createRule(t('sys.login.passwordPlaceholder')));
  const getTeamNameFormRule = computed(() => createRule(t('sys.login.teamNamePlaceholder')));
  // const getMobileFormRule = computed(() => createRule(t('sys.login.mobilePlaceholder')));

  // const validatePolicy = async (_: RuleObject, value: boolean) => {
  //   return !value ? Promise.reject(t('sys.login.policyPlaceholder')) : Promise.resolve();
  // };

  const validateConfirmPassword = (password: string) => {
    return async (_: RuleObject, value: string) => {
      if (!value) {
        return Promise.reject(t('sys.login.passwordPlaceholder'));
      } else if (value !== password) {
        return Promise.reject(t('sys.login.diffPwd'));
      }
      return Promise.resolve();
    };
  };

  const validateEmail = (_: RuleObject, value: string) => {
    if (!value.includes('@')) {
      return Promise.reject('Please include @ in your email address');
    } else if (!value.split('@')[1] || !value.split('@')[0]) {
      return Promise.reject(`Please enter the content before/after “${value}”`);
    }
    return Promise.resolve();
  };

  const getFormRules = computed((): { [k: string]: ValidationRule | ValidationRule[] } => {
    const accountFormRule = unref(getAccountFormRule);
    const emailFormRule = unref(getEmailFormRule);
    const passwordFormRule = unref(getPasswordFormRule);
    const teamFormRule = unref(getTeamNameFormRule);
    console.log(unref(currentState));
    // console.log(formData);
    // const mobileFormRule = unref(getMobileFormRule);

    // const mobileRule = {
    //   sms: smsFormRule,
    //   mobile: mobileFormRule,
    // };
    switch (unref(currentState)) {
      // register form rules
      case LoginStateEnum.REGISTER:
        return {
          username: [
            ...emailFormRule,
            {
              validator: validateEmail,
              trigger: 'change',
            },
            {
              pattern: emailReg,
              message: 'Please enter a valid email',
            },
          ],
          password: [
            ...passwordFormRule,
            {
              validator: validatePassword,
              trigger: 'change',
            },
          ],
        };

      // reset password form rules
      case LoginStateEnum.RESET_PASSWORD:
        return {
          password: [
            ...passwordFormRule,
            {
              validator: validatePassword,
              trigger: 'change',
            },
          ],
          confirmPassword: [
            { validator: validateConfirmPassword(formData?.password), trigger: 'change' },
          ],
        };

      case LoginStateEnum.CREATE_TEAM:
        return {
          name: teamFormRule,
        };

      case LoginStateEnum.SIGNUP_FEED:
        return {
          account: [
            ...accountFormRule,
            { max: 100, message: 'cannot be longer than 100 characters' },
          ],
          email: [
            ...emailFormRule,
            {
              validator: validateEmail,
              trigger: 'change',
            },
            {
              pattern: emailReg,
              message: 'Please enter a valid email',
            },
          ],
          password: [
            ...passwordFormRule,
            {
              validator: validatePassword,
              trigger: 'change',
            },
          ],
        };

      // login form rules
      default:
        return {
          account: [
            ...emailFormRule,
            {
              validator: validateEmail,
              trigger: 'change',
            },
            {
              pattern: emailReg,
              message: 'Please enter a valid email',
            },
          ],
          password: passwordFormRule,
        };
    }
  });
  return { getFormRules };
}

function createRule(message: string) {
  return [
    {
      required: true,
      message,
      trigger: 'change',
    },
  ];
}
