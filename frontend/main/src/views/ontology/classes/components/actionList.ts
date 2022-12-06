import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

export const actionList = [
  {
    text: t('common.action.selectAll'),
    function: 'handleSelectAll',
    svgIcon: 'action-select',
    hasDivider: false,
  },
  {
    text: t('common.action.unselectAll'),
    function: 'handleUnselectAll',
    svgIcon: 'action-unselect',
    hasDivider: false,
  },
  {
    text: 'Save to Ontology Center',
    function: 'handleOntology',
    svgIcon: 'action-ontology',
    hasDivider: true,
  },
  {
    text: 'Delete',
    function: 'handleDeleted',
    svgIcon: 'action-delete',
    hasDivider: false,
  },
];
