import { FormSchema } from '/@/components/Form';

const typeOptions = [
  {
    label: 'Json',
    value: 'Json',
  },
  {
    label: 'New dataset',
    value: 'New dataset',
  },
];

export const formSchema: FormSchema[] = [
  {
    field: 'type',
    label: 'Export to',
    required: true,
    component: 'RadioGroup',
    componentProps: {
      options: typeOptions,
    },
  },
  {
    field: 'format',
    label: 'Export format',
    component: 'Select',
    componentProps: {
      options: [
        {
          label: 'Xtreme 1 format 0.5.5',
          value: '111',
        },
      ],
      defaultValue: '111',
    },
    ifShow: ({ values }) => values.type === 'Json',
  },
  {
    field: 'datasetName',
    label: 'datasetName',
    component: 'Input',
    required: true,
    ifShow: ({ values }) => values.type === 'New dataset',
  },
];
