import { t } from '@/lang';
import { ToolModelEnum } from 'image-editor';

const showCtrl = 'Ctrl/⌘';
const Tags_Instance = [ToolModelEnum.INSTANCE];
const Tags_Segment = [ToolModelEnum.SEGMENTATION];
const Tags_All = [ToolModelEnum.INSTANCE, ToolModelEnum.SEGMENTATION];

export interface IKeyboardConfig {
  label(): string; // 快捷键说明
  tips?: string; // 快捷键提示
  keys: string[]; // 快捷键key组合
  otherKeys?: string[]; // 快捷键key组合
  tags: ToolModelEnum[];
  wrap?: boolean; // ui上label与key是否换行显示
}

// 作业
export const dataConfig: IKeyboardConfig[] = [
  // 屏蔽分割功能
  {
    label: () => t('image.Switch to view/edit Instance'),

    keys: ['Alt', '1'],
    tags: Tags_All,
  },
  {
    label: () => t('image.Switch to view/edit Segmentation'),

    keys: ['Alt', '2'],
    tags: Tags_All,
  },
  {
    label: () => t('image.Page Up'),

    keys: ['Page Up'],
    tags: Tags_All,
  },
  {
    label: () => t('image.Page Down'),

    keys: ['Page Down'],
    tags: Tags_All,
  },
];
// 结果
export const instanceConfig: IKeyboardConfig[] = [
  {
    label: () => t('image.Save'),

    keys: [showCtrl, 'S'],
    tags: Tags_All,
  },
  {
    label: () => t('image.Delete instance/point'),

    keys: ['Delete'],
    tags: Tags_Instance,
  },
  {
    label: () => t('image.Delete Mask'),

    keys: ['Delete'],
    tags: Tags_Segment,
  },
  {
    label: () => t('image.Finish drawing'),

    keys: ['Space'],
    otherKeys: ['Enter'],
    tags: Tags_All,
  },
  {
    label: () => t('image.cloneResult'),

    keys: [showCtrl, 'D'],
    tags: Tags_Instance,
  },
  {
    label: () => t('image.copyResult'),

    keys: [showCtrl, 'C'],
    tags: Tags_Instance,
  },
  {
    label: () => t('image.pasteResult'),

    keys: [showCtrl, 'V'],
    tags: Tags_Instance,
  },
  {
    label: () => t('image.pasteResultAndClass'),

    keys: [showCtrl, 'Alt', 'V'],
    tags: Tags_Instance,
  },
  {
    label: () => t('image.Copy by draging result'),

    keys: [showCtrl, 'Drag'],
    tags: Tags_Instance,
  },
  {
    label: () => t('image.Show/hide tag pad'),

    keys: ['T'],
    tags: Tags_All,
  },
  {
    label: () => t('image.Switch alias/name'),

    keys: ['O'],
    tags: Tags_All,
  },
  {
    label: () => t('image.Move the top edge 1px'),

    keys: ['shift', '↑↓'],
    tags: Tags_Instance,
  },
  {
    label: () => t('image.Move the bottom edge 1px'),

    keys: [showCtrl, '↑↓'],
    tags: Tags_Instance,
  },
  {
    label: () => t('image.Move the left edge 1px'),

    keys: ['shift', '←→'],
    tags: Tags_Instance,
  },
  {
    label: () => t('image.Movem the right edge 1px'),

    keys: [showCtrl, '←→'],
    tags: Tags_Instance,
  },
  {
    label: () => t('image.Move the object 1px'),

    keys: [showCtrl, 'Shift', '↑↓←→'],
    tags: Tags_Instance,
  },
  {
    label: () => t('image.Undo'),

    keys: [showCtrl, 'Z'],
    tags: Tags_All,
  },
  {
    label: () => t('image.Redo'),

    keys: [showCtrl, 'Shift', 'Z'],
    tags: Tags_All,
  },
  {
    label: () => t('image.Group'),
    tips: 'Create group',
    keys: [showCtrl, 'G'],
    tags: Tags_Instance,
  },
  {
    label: () => t('image.Dissolve group'),

    keys: [showCtrl, 'Shift', 'G'],
    tags: Tags_Instance,
  },
  // {
  //     label: ()=>t('image.Parallel result Edge',
  //
  //     keys: ['='],
  //     wrap: false,
  // },
  {
    label: () => t('image.Hollow'),

    keys: ['H'],
    tags: Tags_Instance,
  },
  {
    label: () => t('image.Crop'),

    keys: ['C'],
    tags: Tags_Instance,
  },
  {
    label: () => t('image.Shared edge polygon by points'),

    keys: ['K'],
    tags: Tags_Instance,
  },
  {
    label: () => t('image.Shared edge polygon by edges'),

    keys: [showCtrl, 'K'],
    tags: Tags_Instance,
  },
  {
    label: () => t('image.Switch shared edge'),

    keys: ['L'],
    tags: Tags_Instance,
  },
  {
    label: () => t('image.Horizontal Drawing Model'),

    keys: ['A'],
    tags: Tags_Instance,
  },
  {
    label: () => t('image.Vertical Drawing Model'),

    keys: [showCtrl, 'A'],
    tags: Tags_Instance,
  },
  {
    label: () => t('image.Split polyline'),
    keys: ['Shift', 'F'],
    tags: Tags_Instance,
  },
  {
    label: () => t('common.tipMerge1'),
    keys: ['U'],
    tags: Tags_Instance,
  },
  {
    label: () => t('common.tipMerge2'),
    keys: [showCtrl, 'U'],
    tags: Tags_Instance,
  },
  {
    label: () => t('image.Edit polyline'),

    keys: ['Shift', 'E'],
    tags: Tags_Instance,
  },
];
// 标注结果
export const resultConfig: IKeyboardConfig[] = [
  {
    label: () => t('image.Show Result'),

    keys: ['V'],
    tags: Tags_All,
  },
  {
    label: () => t('image.Show Single Result'),

    keys: ['S'],
    tags: Tags_All,
  },
  {
    label: () => t('image.Crop by selected area'),

    keys: ['Shift', 'C'],
    tags: Tags_Instance,
  },
  {
    label: () => t('image.Switch Results'),

    keys: ['↑↓'],
    tags: Tags_All,
  },
  {
    label: () => t('image.Show Group Result'),

    keys: ['/'],
    tags: Tags_Instance,
  },
  {
    label: () => t('image.Show Comments'),

    keys: ['N'],
    tags: Tags_All,
  },
  {
    label: () => t('image.Show Class'),

    keys: ['M'],
    tags: Tags_All,
  },
  {
    label: () => t('image.Show Result Number'),

    keys: ['J'],
    tags: Tags_All,
  },
  {
    label: () => t('image.Show Attribute'),

    keys: [showCtrl, 'M'],
    tags: Tags_Instance,
  },
  {
    label: () => t('image.Show Series Number'),

    keys: [showCtrl, 'J'],
    tags: Tags_Instance,
  },
  {
    label: () => t('image.Show label and attributes'),

    keys: [','],
    tags: Tags_All,
  },
  {
    label: () => t('image.Show Size'),

    keys: ['B'],
    tags: Tags_Instance,
  },
  {
    label: () => t('image.Switch mark/mask'),

    keys: ['.'],
    tags: Tags_Instance,
  },
  {
    label: () => t('image.Show annotation sequence'),

    keys: ['D'],
    tags: Tags_Instance,
  },
];
// 图片
export const imageConfig: IKeyboardConfig[] = [
  {
    label: () => t('image.Zoom in、Zoom Out'),

    keys: ['wheel'],
    tags: Tags_All,
  },
  {
    label: () => t('image.Drag'),

    keys: ['RightClick'],
    tags: Tags_All,
  },
  {
    label: () => t('image.Reset'),

    keys: ['Z'],
    tags: Tags_All,
  },
];
// 其它
export const elseConfig: IKeyboardConfig[] = [
  {
    label: () => t('image.Cancel window'),

    keys: ['Esc'],
    tags: Tags_All,
  },
  {
    label: () => t('image.Show Auxiliary Line'),

    keys: ['Y'],
    tags: Tags_All,
  },
  {
    label: () => t('image.rotateMeasureLine'),

    keys: ['[ ]'],
    tags: Tags_Instance,
  },
  {
    label: () => t('image.resetMeasureLine'),

    keys: ['\\'],
    tags: Tags_Instance,
  },
  {
    label: () => t('image.Show Auxiliary Shape'),

    keys: ['U'],
    tags: Tags_All,
  },
  {
    label: () => t('image.Show BisectrixLine'),

    keys: ['I'],
    tags: Tags_All,
  },
];
// 分割工具
export const segmentToolConfig: IKeyboardConfig[] = [
  {
    label: () => t('image.Switch Tool'),

    keys: ['X'],
    tags: Tags_Segment,
  },
  {
    label: () => t('image.Add Region'),

    keys: ['2'],
    tags: Tags_Segment,
  },
  {
    label: () => t('image.Crop Region'),

    keys: ['3'],
    tags: Tags_Segment,
  },
];
