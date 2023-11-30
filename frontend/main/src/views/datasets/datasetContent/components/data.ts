import { dataTypeEnum, SortFieldEnum } from '/@/api/business/model/datasetModel';
import { SortTypeEnum } from '/@/api/model/baseModel';
import annotate from '/@/assets/images/dataset/annotate.png';
import unmakeFrameSeries from '/@/assets/images/dataset/unmakeFrameSeries.png';
import modelRun from '/@/assets/images/dataset/modelRun.png';
import splite from '/@/assets/icons/splite.svg';
import { useI18n } from '/@/hooks/web/useI18n';
import { TeamStatusEnum } from '/@/api/business/model/teamModel';
import { SelectedDataSplitType } from '/@/api/business/model/datasetModel';
const { t } = useI18n();

export type actionItem = {
  text: string;
  function: string;
  img?: any;
  isDisabledFlag?: string;
  icon?: string;
  svgIcon?: string;
  hasDivider: boolean;
  permission?: string;
  statusFlag?: TeamStatusEnum;
  children?: any;
};
export const actionList: actionItem[] = [
  {
    text: t('common.action.selectAll'),
    function: 'handleSelectAll',
    // icon: 'ic:baseline-check-box',
    icon: 'ic:baseline-check-box-outline-blank',
    hasDivider: false,
  },
  {
    text: t('common.action.unselectAll'),
    function: 'handleUnselectAll',
    icon: 'ic:baseline-check-box-outline-blank',
    hasDivider: true,
  },
  {
    text: t('business.task.annotate'),
    function: 'handleAnnotate',
    img: annotate,
    isDisabledFlag: 'annotateAndModelRun',
    hasDivider: false,
  },
  {
    text: t('business.models.models'),
    function: 'handleModelRun',
    isDisabledFlag: 'annotateAndModelRun',
    img: modelRun,
    hasDivider: true,
  },

  {
    text: t('business.datasetContent.splitModel.splitInto'),
    function: '',
    isDisabledFlag: 'annotateAndMoelRun',
    img: splite,
    hasDivider: true,
    children: [
      {
        text: t('business.datasetContent.splitModel.Training'),
        type: SelectedDataSplitType.TRAINING,
        function: 'handleSplite',
        img: modelRun,
        hasDivider: true,
      },
      {
        text: t('business.datasetContent.splitModel.Validation'),
        type: SelectedDataSplitType.VALIDATION,
        function: 'handleSplite',
        img: modelRun,
        hasDivider: true,
      },
      {
        text: t('business.datasetContent.splitModel.Test'),
        type: SelectedDataSplitType.TEST,
        function: 'handleSplite',
        img: modelRun,
        hasDivider: true,
      },
      {
        text: t('business.datasetContent.splitModel.NotSplited'),
        function: 'handleSplite',
        type: SelectedDataSplitType.NOT_SPLIT,
        img: modelRun,
        hasDivider: true,
      },
    ],
  },
  {
    text: t('common.delText'),
    function: 'handleDelete',
    icon: 'ic:baseline-delete-forever',
    hasDivider: false,
  },
];

export const actionImageList: actionItem[] = [
  {
    text: t('common.action.selectAll'),
    function: 'handleSelectAll',
    icon: 'ic:baseline-check-box-outline-blank',
    hasDivider: false,
  },
  {
    text: t('common.action.unselectAll'),
    function: 'handleUnselectAll',
    icon: 'ic:baseline-check-box-outline-blank',
    hasDivider: true,
  },
  {
    text: t('business.task.annotate'),
    function: 'handleAnnotate',
    img: annotate,
    hasDivider: false,
    isDisabledFlag: 'annotateActionFlag',
  },
  {
    text: t('business.models.models'),
    function: 'handleModelRun',
    img: modelRun,
    hasDivider: true,
    isDisabledFlag: 'modelRunActionFlag',
  },
  {
    text: t('business.datasetContent.splitModel.splitInto'),
    function: '',
    isDisabledFlag: 'annotateAndMoelRun',
    img: splite,
    hasDivider: true,
    children: [
      {
        text: t('business.datasetContent.splitModel.Training'),
        type: SelectedDataSplitType.TRAINING,
        function: 'handleSplite',
        img: modelRun,
        hasDivider: true,
      },
      {
        text: t('business.datasetContent.splitModel.Validation'),
        type: SelectedDataSplitType.VALIDATION,
        function: 'handleSplite',
        img: modelRun,
        hasDivider: true,
      },
      {
        text: t('business.datasetContent.splitModel.Test'),
        type: SelectedDataSplitType.TEST,
        function: 'handleSplite',
        img: modelRun,
        hasDivider: true,
      },
      {
        text: t('business.datasetContent.splitModel.NotSplited'),
        function: 'handleSplite',
        type: SelectedDataSplitType.NOT_SPLIT,
        img: modelRun,
        hasDivider: true,
      },
    ],
  },
  {
    text: t('common.delText'),
    function: 'handleDelete',
    icon: 'ic:baseline-delete-forever',
    hasDivider: false,
  },
];

export const actionListFrame: actionItem[] = [
  {
    text: t('common.action.selectAll'),
    function: 'handleSelectAll',
    icon: 'ic:baseline-check-box-outline-blank',
    hasDivider: false,
  },
  {
    text: t('common.action.unselectAll'),
    function: 'handleUnselectAll',
    icon: 'ic:baseline-check-box-outline-blank',
    hasDivider: true,
  },
  // {
  //   text: t('business.task.annotate'),
  //   function: 'handleAnnotate',
  //   img: annotate,
  //   hasDivider: false,
  // },
  {
    text: t('business.datasetContent.frameAction.moveOut'),
    function: 'handleUngroup',
    img: unmakeFrameSeries,
    hasDivider: false,
  },
  {
    text: t('business.datasetContent.splitModel.splitInto'),
    function: '',
    isDisabledFlag: 'annotateAndMoelRun',
    img: splite,
    hasDivider: true,
    children: [
      {
        text: t('business.datasetContent.splitModel.Training'),
        type: SelectedDataSplitType.TRAINING,
        function: 'handleSplite',
        img: modelRun,
        hasDivider: true,
      },
      {
        text: t('business.datasetContent.splitModel.Validation'),
        type: SelectedDataSplitType.VALIDATION,
        function: 'handleSplite',
        img: modelRun,
        hasDivider: true,
      },
      {
        text: t('business.datasetContent.splitModel.Test'),
        type: SelectedDataSplitType.TEST,
        function: 'handleSplite',
        img: modelRun,
        hasDivider: true,
      },
      {
        text: t('business.datasetContent.splitModel.NotSplited'),
        function: 'handleSplite',
        type: SelectedDataSplitType.NOT_SPLIT,
        img: modelRun,
        hasDivider: true,
      },
    ],
  },
  {
    text: t('common.delText'),
    function: 'handleDelete',
    icon: 'ic:baseline-delete-forever',
    hasDivider: false,
  },
];

export const dataTypeOption = [
  {
    label: t('common.allText'),
    value: dataTypeEnum.ALL,
  },
  {
    label: t('business.datasetContent.singleData'),
    value: dataTypeEnum.SINGLE_DATA,
  },
  {
    label: t('business.datasetContent.frame'),
    value: dataTypeEnum.FRAME_SERIES,
  },
];

export const dataSortOption = [
  {
    label: t('business.datasetContent.sort.itemName'),
    value: SortFieldEnum.NAME,
  },
  {
    label: t('business.datasetContent.sort.createDate'),
    value: SortFieldEnum.CREATED_AT,
  },
  // {
  //   label: t('business.datasetContent.sort.annotateCount'),
  //   value: SortFieldEnum.ANNOTATION_COUNT,
  // },
];

export const datasetListSortOption = [
  {
    label: t('business.datasetContent.sort.createDate'),
    value: SortFieldEnum.CREATED_AT,
  },
  {
    label: t('business.datasetContent.sort.updateDate'),
    value: SortFieldEnum.UPDATED_AT,
  },
  {
    label: t('business.datasetContent.sort.itemName'),
    value: SortFieldEnum.NAME,
  },
];

export const SortTypeOption = [
  {
    label: t('common.sort.Asc'),
    value: SortTypeEnum.ASC,
  },
  {
    label: t('common.sort.Desc'),
    value: SortTypeEnum.DESC,
  },
];

export enum PageTypeEnum {
  frame = 'FRAME',
  list = 'LIST',
}

export enum SplitedTypeEnum {
  All = 'All',
  Splited = 'Split',
  NotSplited = 'Not Split',
  Training = 'Training',
  Validation = 'Validation',
  Test = 'Test',
}
export enum SplitedTargetDataTypeEnum {
  SPLIT = 'SPLIT',
  NOT_SPLIT = 'NOT_SPLIT',
}
