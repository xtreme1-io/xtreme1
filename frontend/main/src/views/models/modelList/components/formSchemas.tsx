import { FormSchema } from '/@/components/Form/index';
import { datasetTypeEnum } from '/@/api/business/model/datasetModel';
import { useI18n } from '/@/hooks/web/useI18n';
const { t } = useI18n();
export const createForm: FormSchema[] = [
  {
    required: true,
    field: 'name',
    component: 'Input',
    label: t('business.models.modelName'),
    componentProps: {
      placeholder: 'Please enter a model name',
    },
    rules: [
      { required: true, message: 'Please enter a model name' },
      {
        max: 255,
        message: `${t('business.models.modelName')} ${t('business.dataset.nameError')}`,
        trigger: 'change',
      },
    ],
  },
  {
    field: 'datatype',
    label: t('business.models.dataType'),
    component: 'ApiRadioGroup',
    componentProps: {
      options: [
        { label: 'Image', value: 'Image' },
        { label: 'LiDAR', value: 'LiDAR' },
      ],
    },
    required: true,
    defaultValue: 'Image',
  },
  {
    field: 'modaltype',
    label: t('business.models.modelType'),
    component: 'ApiRadioGroup',
    componentProps: {
      options: [{ label: 'Detection', value: 'Detection' }],
    },
    defaultValue: 'Detection',
  },
  {
    field: 'Description',
    label: ' ',
    component: 'Input',
    colSlot: 'description',
    colProps: { lg: 24 },
  },
];
