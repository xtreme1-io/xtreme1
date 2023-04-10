import type { RuleObject } from 'ant-design-vue/lib/form/interface';
import { ref } from 'vue';
import { useI18n } from '/@/hooks/web/useI18n';

export const lengthVali = ref(false);
export const numberVali = ref(false);
export const letterVali = ref(false);
const rC = {
  lW: '[a-zA-Z]',
  nW: '[0-9]',
};
function Reg(value, rStr) {
  const reg = new RegExp(rStr);
  if (reg.test(value)) return true;
  else return false;
}
export const validatePassword = async (_: RuleObject, value: string) => {
  const { t } = useI18n();
  const tR = {
    l: Reg(value, rC.lW),
    n: Reg(value, rC.nW),
  };
  numberVali.value = tR.n;
  letterVali.value = tR.l;
  lengthVali.value = value.length >= 8 && value.length <= 64;
  if (tR.l && tR.n && lengthVali.value) {
    return Promise.resolve();
  }
  return Promise.reject(t('sys.login.passwordValidationError'));
};
