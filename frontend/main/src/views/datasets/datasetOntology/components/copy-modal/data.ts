import { useI18n } from '/@/hooks/web/useI18n';
import { actionItem } from '/@/views/datasets/datasetContent/components/data';

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

export enum ICopyEnum {
  ONTOLOGY = 'ONTOLOGY',
  CLASSES = 'CLASSES',
  CONFLICT = 'CONFLICT',
}

export enum ICopySelectEnum {
  REPLACE = 'REPLACE',
  KEEP = 'KEEP',
  NONE = 'NONE',
}

export interface IFormState {
  ontologyId: undefined | string | number;
  ontologyName: undefined | string;
}
