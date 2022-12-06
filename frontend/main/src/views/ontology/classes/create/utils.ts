import { RuleObject } from 'ant-design-vue/es/form/interface';
import { v4 } from 'uuid';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

export const handleAddUuid = (list: any) => {
  list.forEach((item) => {
    item.uuid = item.uuid ?? v4();
    handleAddUuid(item.options ?? item.attributes);
  });
};

/** Validate Name */
export const validateName = async (_rule: RuleObject, value: string) => {
  if (!value) {
    return Promise.reject(t('business.ontology.modal.nameRequired'));
  } else {
    return Promise.resolve();
  }
  // if (!value) {
  //   return Promise.reject(t('business.ontology.modal.nameRequired'));
  // } else {
  //   // OntologyCenter | DatasetOntology
  //   if (value === baseFormName.value) {
  //     // name has not changed, no duplicate name verification
  //     return Promise.resolve();
  //   }

  //   const params: ValidateNameParams = {
  //     name: formState.name ?? '',
  //     datasetId: props.datasetId as number,
  //   };
  //   if (props.activeTab == ClassTypeEnum.CLASS) {
  //     try {
  //       const res = await validateClassNameApi(params);
  //       if (!res) {
  //         afterValid(true, value);
  //         return Promise.resolve();
  //       } else {
  //         emits('valid', true);
  //         const text =
  //           t('business.class.class') +
  //           ` "${params.name}" ` +
  //           t('business.ontology.modal.alreadyExits') +
  //           t('business.ontology.modal.enterNewName');
  //         return Promise.reject(text);
  //       }
  //     } catch {}
  //   } else {
  //     try {
  //       const res = await validateClassificationNameApi(params);
  //       if (!res) {
  //         afterValid(true, value);
  //         return Promise.resolve();
  //       } else {
  //         emits('valid', true);
  //         const text =
  //           t('business.class.classification') +
  //           ` "${params.name}" ` +
  //           t('business.ontology.modal.alreadyExits') +
  //           t('business.ontology.modal.enterNewName');
  //         return Promise.reject(text);
  //       }
  //     } catch {}
  //   }
  // }
};
