import { RuleObject } from 'ant-design-vue/es/form/interface';
import { useI18n } from '/@/hooks/web/useI18n';
import { validateNameApi } from '/@/api/business/ontology';

const { t } = useI18n();

export const validateCreateName = async (_rule: RuleObject, value: string) => {
  if (value === '') {
    return Promise.reject(t('business.ontology.noOntologyName'));
  }

  const res = await validateNameApi({ name: value });

  if (res) {
    return Promise.resolve();
  } else {
    const text = t('business.ontology.duplicate');
    return Promise.reject(text);
  }
};

export const validateReName = async (_rule: RuleObject, value: string) => {
  if (value === '') {
    return Promise.reject(t('business.ontology.noOntologyName'));
  }

  const res = await validateNameApi({ name: value });

  if (res) {
    return Promise.resolve();
  } else {
    const text = t('business.ontology.ontology') + ` “${value}” ` + t('business.ontology.hasExist');
    return Promise.reject(text);
  }
};
