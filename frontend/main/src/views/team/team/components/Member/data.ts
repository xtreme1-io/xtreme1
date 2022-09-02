import { actionItem } from '/@/views/datasets/datasetContent/components/data';
import { useI18n } from '/@/hooks/web/useI18n';
import { TeamStatusEnum } from '/@/api/business/model/teamModel';
const { t } = useI18n();

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
    hasDivider: false,
  },
];

export const moreList: actionItem[] = [
  {
    text: 'Assign to Group',
    function: 'assignGroup',
    svgIcon: 'assign-to-group',
    hasDivider: false,
  },
  {
    text: 'Cancel Invitation',
    function: 'cancel',
    svgIcon: 'cancel-invitation',
    hasDivider: false,
    statusFlag: TeamStatusEnum.ACTIVE,
  },
  {
    text: 'Remove from Team',
    function: 'remove',
    svgIcon: 'remove-from-team',
    hasDivider: false,
    statusFlag: TeamStatusEnum.PENDING,
  },
];
