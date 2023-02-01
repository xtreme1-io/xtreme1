import { RuleObject } from 'ant-design-vue/es/form/interface';
import { v4 } from 'uuid';
import { ICLassForm, IClassificationForm, imageConstraintsEnum } from './typing';
import { inputTypeEnum } from '/@/api/business/model/classesModel';
import { datasetTypeEnum } from '/@/api/business/model/datasetModel';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

export const handleAddUuid = (list: any) => {
  list.forEach((item) => {
    item.id = item.id ?? v4();
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

export const getDefaultCreateClassFormState = (formState: ICLassForm) => {
  formState.name = undefined;
  formState.color = '#7dfaf2';
  formState.datasetType = datasetTypeEnum.IMAGE;
  formState.toolType = undefined;
  formState.isConstraints = false;
  formState.isStandard = false;
  formState.length = [undefined, undefined];
  formState.width = [undefined, undefined];
  formState.height = [undefined, undefined];
  formState.points = undefined;
  formState.isConstraintsForImage = false;
  formState.imageLimit = imageConstraintsEnum.SIZE;
  formState.imageLength = [undefined, undefined];
  formState.imageWidth = [undefined, undefined];
  formState.imageArea = [undefined, undefined];
  formState.ontologyId = undefined;
  formState.classId = undefined;
};

export const getDefaultCreateClassificationFormState = (formState: IClassificationForm) => {
  formState.name = undefined;
  formState.inputType = inputTypeEnum.RADIO;
  formState.isRequired = false;
};

export const isObjectChanged = (source, comparison): boolean => {
  const _source = JSON.stringify(source);
  const _comparison = JSON.stringify({ ...source, ...comparison });

  return _source == _comparison;
};

export const getCreateClassParams = (config) => {
  const { formState, props, dataSchema } = config;
  const params: any = {
    name: formState.name,
    color: formState.color,
    toolType: formState.toolType,
    toolTypeOptions: {},
    attributes: [...dataSchema.attributes],
  };
  // isUpdate
  if (props.detail?.id) {
    params.id = props.detail?.id;
  }
  // isCenter
  if (props.isCenter) {
    params.ontologyId = props.ontologyId;
    params.isResetRelations = config.isResetRelations;
  } else {
    params.ontologyId = formState.ontologyId ?? undefined;
    params.classId = formState.classId ?? undefined;
    params.datasetId = props.datasetId;
  }
  // toolTypeOptions
  if (props.datasetType != datasetTypeEnum.IMAGE) {
    params.toolTypeOptions = {
      isConstraints: formState.isConstraints ?? false,
      isStandard: formState.isStandard ?? false,
      length: formState.length,
      width: formState.width,
      height: formState.height,
      points: formState.points,
    };
  } else {
    // params.toolTypeOptions = {
    //   isConstraintsForImage: formState.isConstraintsForImage ?? false,
    //   imageLimit: formState.imageLimit,
    //   imageLength: formState.imageLength,
    //   imageWidth: formState.imageWidth,
    //   imageArea: formState.imageArea,
    // };
  }

  return params;
};
export const getCreateClassificationParams = (config) => {
  const { formState, props, dataSchema } = config;

  const params: any = {
    ontologyId: props.ontologyId ?? undefined,
    name: formState.name,
    inputType: formState.inputType,
    isRequired: formState.isRequired,
    attribute: {},
  };
  // isUpdate
  if (props.detail?.id) {
    params.id = props.detail?.id;
  }
  // isCenter
  if (props.isCenter) {
  } else {
    params.datasetId = props.datasetId ?? undefined;
    params.classificationId = props.classificationId ?? undefined;
  }

  params.attribute = {
    id: props.detail?.attribute?.id ?? v4(),
    name: formState.name,
    type: formState.inputType,
    required: formState.isRequired,
    options: [...dataSchema.options],
  };

  return params;
};
