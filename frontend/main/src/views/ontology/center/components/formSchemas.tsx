import { RuleObject } from 'ant-design-vue/es/form/interface';
import { useI18n } from '/@/hooks/web/useI18n';
import { validateOntologyNameApi } from '/@/api/business/ontology';
import { datasetTypeEnum } from '/@/api/business/model/datasetModel';

const { t } = useI18n();

export const validateCreateName = (type: datasetTypeEnum) => {
  return async (_rule: RuleObject, value: string) => {
    if (value === '') {
      return Promise.reject(t('business.ontology.noOntologyName'));
    }

    const res = await validateOntologyNameApi({ name: value, type: type });

    if (!res) {
      return Promise.resolve();
    } else {
      const text = t('business.ontology.duplicate');
      return Promise.reject(text);
    }
  };
};

export const validateReName = (ontologyId: string, type: datasetTypeEnum) => {
  return async (_rule: RuleObject, value: string) => {
    if (value === '') {
      return Promise.reject(t('business.ontology.noOntologyName'));
    }

    const res = await validateOntologyNameApi({ name: value, id: ontologyId, type: type });

    if (!res) {
      return Promise.resolve();
    } else {
      const text =
        t('business.ontology.ontology') + ` “${value}” ` + t('business.ontology.hasExist');
      return Promise.reject(text);
    }
  };
};
