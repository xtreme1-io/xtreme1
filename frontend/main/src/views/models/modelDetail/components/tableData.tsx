import { useI18n } from '/@/hooks/web/useI18n';
import { BasicColumn } from '/@/components/Table';
import { Button } from '/@@/Button';
import { Tooltip, Progress } from 'ant-design-vue';
import failureSvg from '/@/assets/images/models/failure.svg';
import { statusEnum, ModelRunItem } from '/@/api/business/model/modelsModel';
import { getDateTime } from '/@/utils/business/timeFormater';
import Icon, { SvgIcon } from '/@/components/Icon';
const { t } = useI18n();
const inactiveFilterIcon = (
  <SvgIcon name={'filter-inactive'} size={14} style={{ transform: 'translateY(-2px)' }} />
);
const activeFilterIcon = (
  <SvgIcon name={'filter-active'} size={14} style={{ transform: 'translateY(-2px)' }} />
);
export const stageFilter = [
  {
    text: t('business.task.annotate'),
    value: '111',
  },
  {
    text: t('business.task.review'),
    value: '22',
  },
];
// status 颜色
const statusColor = {
  [statusEnum.started]: '#86AFFE',
  [statusEnum.success]: '#7FF0B3',
  [statusEnum.failure]: '#F8827B',
  [statusEnum.running]: '#57CCEF',
  [statusEnum.SUCCESS_WITH_ERROR]: '#FCB17A',
};
const formatStatusText = (status: statusEnum) => {
  const statusList = {
    [statusEnum.started]: t('common.status.started'),
    [statusEnum.success]: t('common.status.success'),
    [statusEnum.failure]: t('common.status.failure'),
    [statusEnum.running]: t('common.status.running'),
    [statusEnum.SUCCESS_WITH_ERROR]: t('common.status.successWithError'),
  };
  return statusList[status];
};

/** 表格头 */
export function getBasicColumns(): BasicColumn[] {
  return [
    { title: '', dataIndex: '', width: 20 },
    { title: t('business.models.run.runId'), dataIndex: 'runNo', align: 'left' },
    {
      title: t('business.models.run.datasetName'),
      dataIndex: 'datasetName',
      align: 'left',
      filters: stageFilter,
      filterIcon: ({ filtered }) => {
        return filtered ? activeFilterIcon : inactiveFilterIcon;
      },
      onFilter: (value: string, record: any) => record.datasetType.indexOf(value) === 0,
    },
    {
      title: t('business.models.run.type'),
      dataIndex: 'type',
      align: 'left',
      filters: stageFilter,
      filterIcon: ({ filtered }) => {
        return filtered ? activeFilterIcon : inactiveFilterIcon;
      },
      onFilter: (value: string, record: any) => record.datasetType.indexOf(value) === 0,
    },
    { title: t('business.models.run.DataCount'), dataIndex: 'DataCount', align: 'left' },

    {
      title: t('business.models.run.Metrics'),
      dataIndex: 'Metrics',
      align: 'left',
      customRender: ({ record }) => {
        return (
          <div class="flex items-center gap-5px">
            34343
            <Tooltip title={getErrorReason(record.errorReason)}>more</Tooltip>
          </div>
        );
      },
    },
    {
      title: t('business.models.run.createdAt'),
      dataIndex: 'createdAt',
      slots: { customRender: 'createdAt' },
      align: 'left',
      sorter: (a, b) => a.age - b.age,
      // sorter: true,
      sortOrder: 'ascend',
      customRender: ({ record }) => {
        return <span>{getDateTime(record.createdAt)}</span>;
      },
    },
    {
      title: t('business.models.run.status'),
      dataIndex: 'status',
      align: 'left',
      filters: stageFilter,
      filterIcon: ({ filtered }) => {
        return filtered ? activeFilterIcon : inactiveFilterIcon;
      },
      onFilter: (value: string, record: any) => record.datasetType.indexOf(value) === 0,
      customRender: ({ record }) => {
        return (
          <div class="flex items-center gap-5px">
            <span style={{ color: statusColor[record.status] }}>
              {formatStatusText(record.status)}
              {/* { record.status.split('_').join(' ').toLowerCase()} */}
            </span>
            <span
              v-show={
                record.status == statusEnum.failure ||
                record.status == statusEnum.SUCCESS_WITH_ERROR
              }
            >
              <Tooltip title={getErrorReason(record.errorReason)}>
                <img class="w-14px h-14px cursor-pointer" src={failureSvg} alt="failure" />
              </Tooltip>
            </span>
          </div>
        );
      },
    },
    {
      title: t('business.models.run.progress'),
      dataIndex: 'completionRate',
      align: 'left',
      customRender: ({ record }) => {
        return (
          <Progress
            style="width: 135px"
            percent={record.completionRate * 100}
            strokeWidth={12}
            trailColor={'#aaa'}
            strokeColor={'#57CCEF'}
            format={(percent) => `${percent.toFixed(0)}%`}
          />
        );
      },
    },
  ];
}

export function getActionColumn(funcObj: {
  view: (r: ModelRunItem) => void;
  delete: (r: ModelRunItem) => void;
  rerun: (r: ModelRunItem) => void;
}): BasicColumn {
  return {
    width: 220,
    title: t('business.models.run.actions'),
    dataIndex: 'action',
    align: 'left',
    customRender: ({ record }) => {
      if (record.status !== statusEnum.failure) {
        return (
          <div class="flex gap-8px">
            <Button
              type="default"
              onClick={() => {
                funcObj.view(record);
              }}
            >
              {t('business.models.run.viewDataset')}
            </Button>
            <Button
              type="primary"
              danger
              onClick={() => {
                funcObj.delete(record);
              }}
            >
              {t('business.models.run.delete')}
            </Button>
          </div>
        );
      } else {
        return (
          <div class="flex gap-8px">
            <Button
              danger
              ghost
              onClick={() => {
                funcObj.rerun(record);
              }}
            >
              {t('business.models.run.reRun')}
            </Button>
          </div>
        );
      }
    },
  };
}

function getErrorReason(errorReason) {
  if (errorReason) {
    return JSON.parse(errorReason)[0].split(':')[1];
  }
}
