import emitter from 'tiny-emitter/instance';
import { FormSchema } from '/@/components/Form/index';
import { inputTypeEnum } from '/@/api/business/model/classesModel';
import { useI18n } from '/@/hooks/web/useI18n';
import { RuleObject } from 'ant-design-vue/es/form/interface';

const { t } = useI18n();

// let timer;
export const attributeBase = (list): FormSchema[] => {
  return [
    {
      field: 'name',
      label: t('business.ontology.modal.attributeName'),
      rules: [
        { required: true, validator: validateName(list), trigger: 'change' },
        { max: 256, message: t('business.ontology.maxLength') },
      ],
      component: 'Input',
      componentProps: {
        onBlur: () => {
          emitter.emit('handleSaveForm');
        },
        allowClear: true,
      },
    },
    {
      field: 'type',
      label: t('business.ontology.modal.inputType'),
      component: 'Select',
      slot: 'inputType',
      defaultValue: inputTypeEnum.RADIO,
    },
    {
      field: 'required',
      label: '',
      component: 'Switch',
      suffix: t('business.ontology.modal.required'),
      colProps: { span: 12 },
      componentProps: {
        onChange: (e) => {
          emitter.emit('handleSaveForm', { required: e });
        },
      },
    },
  ];
};

export const optionBase = (list): FormSchema[] => {
  console.log(list);

  return [
    {
      field: 'name',
      label: t('business.ontology.modal.optionName'),
      rules: [
        {
          required: true,
          validator: validateName(list),
          trigger: 'change',
        },
        { max: 256, message: t('business.ontology.maxLength') },
      ],
      component: 'Input',
      componentProps: {
        onBlur: () => {
          emitter.emit('handleSaveForm');
        },
        allowClear: true,
      },
    },
  ];
};

export const validateName = (list: string[]) => {
  console.log(list);
  return async (_rule: RuleObject, value: string) => {
    if (value === '') {
      return Promise.reject(t('business.ontology.modal.nameRequired'));
    } else if (list.some((item) => item == value)) {
      return Promise.reject('Duplicated Name');
    } else if (value.includes(':') || value.includes('：')) {
      return Promise.reject(': is not allowed');
    } else {
      return Promise.resolve();
    }
  };
};
