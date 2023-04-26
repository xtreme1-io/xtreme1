import { FormSchema } from '/@/components/Form/index';
import { inputType } from './typing';
import { ToolTypeEnum } from '/@/api/business/model/classModel';
import { useI18n } from '/@/hooks/web/useI18n';
import ploygon from '../../../../assets/images/class/polygon.png';
import cuboid from '../../../../assets/images/class/cuboid.png';
import bounding_box from '../../../../assets/images/class/bounding_box.png';
import polyline from '../../../../assets/images/class/polyline.png';
import key_point from '../../../../assets/images/class/key_point.png';
import radioIcon from '/@/assets/images/class/radio_icon.png';
import checkIcon from '/@/assets/images/class/check_icon.png';
import dropdownIcon from '/@/assets/images/class/dropdown_icon.png';
import textIcon from '/@/assets/images/class/text_icon.png';
const { t } = useI18n();

export const toolTypeList = [
  {
    id: 1,
    img: bounding_box,
    type: ToolTypeEnum.BOUNDING_BOX,
    text: t('business.class.toolType.boundingBox'),
  },
  {
    id: 2,
    img: ploygon,
    type: ToolTypeEnum.POLYGON,
    text: t('business.class.toolType.polygon'),
  },
  {
    id: 3,
    img: polyline,
    type: ToolTypeEnum.POLYLINE,
    text: t('business.class.toolType.polyline'),
  },
  {
    id: 4,
    img: key_point,
    type: ToolTypeEnum.KEY_POINT,
    text: t('business.class.toolType.keyPoint'),
  },
];

export const toolTypeList3D = [
  {
    id: 1,
    img: cuboid,
    type: ToolTypeEnum.CUBOID,
    text: t('business.class.toolType.cuboid'),
  },
];

export const classBase = (is3D): FormSchema[] => {
  const data: FormSchema[] = [
    { field: 'name', component: 'Input', label: t('business.class.className') },
    {
      field: 'color',
      label: 'Color',
      slot: 'colorSlot',
      component: 'Input',
    },
    {
      field: 'toolType',
      label: 'Tool Type',
      component: 'Input',
      slot: 'toolType',
      defaultValue: is3D ? ToolTypeEnum.CUBOID : ToolTypeEnum.BOUNDING_BOX,
    },
  ];
  if (is3D) {
    data.push({
      field: 'cuboidProperties',
      label: 'Cuboid Setting',
      component: 'Input',
      slot: 'cuboidSetting',
      defaultValue: {},
    });
  }
  return data;
};

export const inputItemImg = {
  [inputType.Radio]: radioIcon,
  [inputType.MultiSelection]: checkIcon,
  [inputType.Dropdown]: dropdownIcon,
  [inputType.Text]: textIcon,
  [inputType.LongText]: textIcon,
};

function getOption() {
  const options: any[] = [];

  for (const key in inputType) {
    options.push({
      label: key,
      img: inputItemImg[key],
      value: inputType[key],
      key: key,
    });
  }
  console.log(inputType);
  console.log(options);
  return options;
}

export const attributeBase = (handleChangeType): FormSchema[] => {
  return [
    { field: 'name', component: 'Input', label: 'Attribute Name' },
    {
      field: 'type',
      component: 'Select',
      componentProps: {
        onChange: handleChangeType,
        options: getOption(),
        defaultValue: inputType.Radio,
      },
      defaultValue: inputType.Radio,
      label: 'Input Type',
    },
    {
      field: 'required',
      component: 'Switch',
      label: '',
      suffix: 'Required',
      defaultValue: false,
      colProps: { span: 12 },
    },
  ];
};

export const classificationBase = (handleChangeType): FormSchema[] => [
  { field: 'name', component: 'Input', label: 'Classification Name' },
  {
    field: 'inputType',
    component: 'Select',
    componentProps: {
      onChange: handleChangeType,
      options: getOption(),
      defaultValue: inputType.Radio,
    },
    defaultValue: inputType.Radio,
    label: 'Input Type',
  },
  {
    field: 'isRequired',
    component: 'Switch',
    label: '',
    suffix: 'Required',
    defaultValue: false,
    colProps: { span: 12 },
  },
];

export const optionBase: FormSchema[] = [
  { field: 'name', component: 'Input', label: 'Option Name' },
];
