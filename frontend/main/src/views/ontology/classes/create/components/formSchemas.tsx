import emitter from 'tiny-emitter/instance';
import { FormSchema } from '/@/components/Form/index';
import { inputTypeEnum } from '/@/api/business/model/ontologyClassesModel';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

let timer;
export const attributeBase = (): FormSchema[] => {
  return [
    {
      field: 'name',
      label: t('business.ontology.modal.attributeName'),
      rules: [
        { required: true, message: t('business.ontology.modal.nameRequired'), trigger: 'blur' },
        { max: 256, message: t('business.ontology.maxLength') },
      ],
      component: 'Input',
      componentProps: {
        onChange: () => {
          console.log('input change');
          clearTimeout(timer);
          timer = setTimeout(() => {
            emitter.emit('handleSaveForm', { type: 'change' });
          }, 500);
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
      defaultValue: false,
      colProps: { span: 12 },
      componentProps: {
        onChange: () => {
          emitter.emit('handleSaveForm', { type: 'change' });
        },
      },
    },
  ];
};

export const optionBase: FormSchema[] = [
  {
    field: 'name',
    label: t('business.ontology.modal.optionName'),
    rules: [
      { required: true, message: t('business.ontology.modal.nameRequired'), trigger: 'blur' },
      { max: 256, message: t('business.ontology.maxLength') },
    ],
    component: 'Input',
    componentProps: {
      onBlur: () => {
        // emitter.emit('handleSaveForm');
      },
      allowClear: true,
    },
  },
];
