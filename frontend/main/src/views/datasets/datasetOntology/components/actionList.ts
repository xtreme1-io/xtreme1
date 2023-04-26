import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

export const actionList = [
  {
    text: t('common.action.selectAll'),
    function: 'handleSelectAll',
    svgIcon: 'action-classes-selectAll',
    hasDivider: false,
  },
  {
    text: t('common.action.unselectAll'),
    function: 'handleUnselectAll',
    svgIcon: 'action-classes-unselectAll',
    hasDivider: false,
  },
  {
    text: 'Save to Ontology Center',
    function: 'handleSaveToOntology',
    svgIcon: 'action-classes-saveTo',
    hasDivider: true,
  },
  {
    text: 'Delete',
    function: 'handleDeleted',
    svgIcon: 'action-classes-delete',
    hasDivider: false,
  },
];

export const textActionList = [
  {
    text: t('common.action.selectAll'),
    function: 'handleSelectAll',
    svgIcon: 'action-classes-selectAll',
    hasDivider: false,
  },
  {
    text: t('common.action.unselectAll'),
    function: 'handleUnselectAll',
    svgIcon: 'action-classes-unselectAll',
    hasDivider: false,
  },
  {
    text: 'Delete',
    function: 'handleDeleted',
    svgIcon: 'action-classes-delete',
    hasDivider: false,
  },
];
