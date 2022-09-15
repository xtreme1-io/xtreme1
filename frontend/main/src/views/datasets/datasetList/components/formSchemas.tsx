import { FormSchema } from '/@/components/Form/index';
import { datasetTypeEnum } from '/@/api/business/model/datasetModel';
import { useI18n } from '/@/hooks/web/useI18n';
const { t } = useI18n();
export const createForm: FormSchema[] = [
  {
    field: 'name',
    component: 'Input',
    label: t('business.dataset.datasetName'),
    componentProps: {
      placeholder: 'Please enter a dataset name',
    },
    rules: [
      { required: true, message: 'Please enter a dataset name' },
      {
        max: 255,
        message: `${t('business.dataset.datasetName')} ${t('business.dataset.nameError')}`,
        trigger: 'change',
      },
    ],
  },
  {
    field: 'type',
    label: t('business.dataset.datasetType'),
    component: 'RadioGroup',
    colSlot: 'abcSlot',
    defaultValue: datasetTypeEnum.LIDAR_FUSION,
  },
];
