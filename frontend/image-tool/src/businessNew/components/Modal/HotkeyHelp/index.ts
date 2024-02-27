import { AnnotateModeEnum } from 'image-editor';

const showCtrl = 'Ctrl/⌘';
const Tags_Instance = [AnnotateModeEnum.INSTANCE];
// const Tags_Segment = [AnnotateModeEnum.SEGMENTATION];
const Tags_All = [AnnotateModeEnum.INSTANCE, AnnotateModeEnum.SEGMENTATION];

export interface IKeyboardConfig {
  label: string;
  tips: string;
  keys: string[];
  otherKeys?: string[];
  tags: AnnotateModeEnum[];
  wrap?: boolean;
}

export const dataConfig: IKeyboardConfig[] = [
  {
    label: 'Page Up',
    tips: '',
    keys: ['Page Up'],
    tags: Tags_All,
  },
  {
    label: 'Page Down',
    tips: '',
    keys: ['Page Down'],
    tags: Tags_All,
  },
];
export const instanceConfig: IKeyboardConfig[] = [
  {
    label: 'Save',
    tips: '',
    keys: [showCtrl, 'S'],
    tags: Tags_All,
  },
  {
    label: 'Delete instance/point',
    tips: '',
    keys: ['Delete'],
    tags: Tags_Instance,
  },
  {
    label: 'Finish drawing',
    tips: '',
    keys: ['Space'],
    otherKeys: ['Enter'],
    tags: Tags_All,
  },
  {
    label: 'Show/hide tag pad',
    tips: '',
    keys: ['T'],
    tags: Tags_All,
  },
  {
    label: 'Move the object 1px',
    tips: '',
    keys: [showCtrl, 'Shift', '↑↓←→'],
    tags: Tags_Instance,
  },
  {
    label: 'Undo',
    tips: '',
    keys: [showCtrl, 'Z'],
    tags: Tags_All,
  },
  {
    label: 'Redo',
    tips: '',
    keys: [showCtrl, 'Shift', 'Z'],
    tags: Tags_All,
  },
  {
    label: 'Hollow',
    tips: '',
    keys: ['H'],
    tags: Tags_Instance,
  },
  {
    label: 'Crop',
    tips: '',
    keys: ['C'],
    tags: Tags_Instance,
  },
  {
    label: 'Horizontal Drawing Model',
    tips: '',
    keys: ['A'],
    tags: Tags_Instance,
  },
  {
    label: 'Vertical Drawing Model',
    tips: '',
    keys: [showCtrl, 'A'],
    tags: Tags_Instance,
  },
];
export const resultConfig: IKeyboardConfig[] = [
  {
    label: 'Show Class',
    tips: '',
    keys: ['M'],
    tags: Tags_All,
  },
  {
    label: 'Show Size',
    tips: '',
    keys: ['B'],
    tags: Tags_Instance,
  },
  // {
  //   label: 'Show annotation sequence',
  //   tips: '',
  //   keys: ['D'],
  //   tags: Tags_Instance,
  // },
];
export const imageConfig: IKeyboardConfig[] = [
  {
    label: 'Zoom in、Zoom Out',
    tips: '',
    keys: ['wheel'],
    tags: Tags_All,
  },
  {
    label: 'Drag',
    tips: '',
    keys: ['RightClick'],
    tags: Tags_All,
  },
];
// 其它
export const elseConfig: IKeyboardConfig[] = [
  {
    label: 'Cancel window',
    tips: '',
    keys: ['Esc'],
    tags: Tags_All,
  },
  {
    label: 'Show Auxiliary Line',
    tips: '',
    keys: ['Y'],
    tags: Tags_All,
  },
];
