import { useI18n } from '/@/hooks/web/useI18n';
import { BasicColumn } from '/@/components/Table';
import { Tooltip, Progress, Input, Button, Select } from 'ant-design-vue';
import failureSvg from '/@/assets/images/models/failure.svg';
import { statusEnum, ModelRunItem } from '/@/api/business/model/modelsModel';
import { getDateTime } from '/@/utils/business/timeFormater';
import Icon, { SvgIcon } from '/@/components/Icon';
import { defineComponent, onMounted, reactive, ref, toRefs, watch } from 'vue';
import { findModelRunFilterDatasetNameApi } from '/@/api/business/models';
import RunsCustomMetric from './RunsCustomMetric.vue';
const { t } = useI18n();
const inactiveFilterIcon = (
  <SvgIcon name={'filter-inactive'} size={14} style={{ transform: 'translateY(-2px)' }} />
);
const activeFilterIcon = (
  <SvgIcon name={'filter-active'} size={14} style={{ transform: 'translateY(-2px)' }} />
);
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
const filterSelect = defineComponent({
  props: {
    setSelectedKeys: Function,
    selectedKeys: String,
    confirm: Function,
    clearFilters: Function,
    column: Array,
  },
  setup(props) {
    const { setSelectedKeys, selectedKeys, confirm, clearFilters, column } = toRefs(props);
    const data = ref<Array<any>>([]);
    const selectValue = ref([]);
    const fetching = ref(true);

    const findModelRunFilterDatasetName = async (name) => {
      const res = await findModelRunFilterDatasetNameApi({ datasetName: name });
      if (res && Array.isArray(res)) data.value = res.map((i) => ({ value: i.id, label: i.name }));
    };
    // watch(
    //   () => selectValue.value,
    //   () => {
    //     data.value = [];
    //     fetching.value = false;
    //   },
    // );
    onMounted(() => {
      // reset();
      // getCount();
    });
    return () => (
      <>
        {
          <div style="padding:20px;max-width:220px">
            <div style="padding-bottom:20px" class="flex; ">
              {' '}
              <a
                onClick={() => {
                  props.setSelectedKeys(selectValue.value);
                  props.confirm();
                }}
                size={'small'}
                style=""
              >
                Ok
              </a>
              <a
                style="float:right"
                size="small"
                onClick={() => {
                  selectValue.value = [];
                  clearFilters.value({ confirm: true });
                }}
              >
                Reset
              </a>{' '}
            </div>
            <Select
              value={selectValue.value}
              onChange={(e) => {
                selectValue.value = e;
              }}
              mode="multiple"
              label-in-value
              placeholder="write datasetName"
              style="min-width:120px; height:40px;  display: block"
              filterOption={false}
              notFoundContent={fetching.value ? undefined : null}
              options={data.value}
              onSearch={(name) => {
                findModelRunFilterDatasetName(name);
              }}
            ></Select>
          </div>
        }
      </>
    );
  },
});

export function getBasicColumns(): BasicColumn[] {
  return [
    // { title: '', dataIndex: '', width: 20 },
    {
      title: t('business.models.run.runId'),
      dataIndex: 'runNo',

      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, column }) => {
        const handleSearch = (selectedKeys, confirm, dataIndex) => {
          confirm();
          // state.searchText = selectedKeys[0];
          // state.searchedColumn = dataIndex;
        };

        const handleReset = (clearFilters) => {
          clearFilters({ confirm: true });
          // state.searchText = '';
        };
        return (
          <div style=" padding:10px">
            {' '}
            <Input
              style="max-width: 150px; display: block"
              value={selectedKeys}
              onChange={(e) => setSelectedKeys(e.target.value ? e.target.value : '')}
              onPressEnter={(A) => {}}
            />
            <div style={'margin-top:10px'}>
              {' '}
              <a
                onClick={() => handleSearch(selectedKeys, confirm, column.dataIndex)}
                type="primary"
                size={'small'}
              >
                ok
              </a>
              <a size="small" style="float:right" onClick={() => handleReset(clearFilters)}>
                Reset
              </a>{' '}
            </div>
          </div>
        );
      },
      align: 'left',
    },
    {
      title: t('business.models.run.datasetName'),
      dataIndex: 'datasetName',
      align: 'left',
      filterDropdown: (config) => {
        return (
          <div>
            <filterSelect {...config}></filterSelect>
          </div>
        );
      },

      filterIcon: ({ filtered }) => {
        return filtered ? activeFilterIcon : inactiveFilterIcon;
      },
      // onFilter: (value: string, record: any) => {
      //   // record.id=
      //   console.log(value, record);
      //   return record;
      // },
    },
    {
      title: t('business.models.run.type'),
      dataIndex: 'runRecordType',
      align: 'left',
      filterMultiple: false,
      width: '80px',
      filters: [
        {
          text: 'Runs',
          value: 'RUNS',
        },
        {
          text: 'Imported',
          value: 'IMPORTED',
        },
      ],
      filterIcon: ({ filtered }) => {
        return filtered ? activeFilterIcon : inactiveFilterIcon;
      },
      // onFilter: (value: string, record: any) => record.runRecordType,
      // format: (v: any) => {
      //   return formatTaskType(v);
      // },
    },
    {
      title: t('business.models.run.DataCount'),
      width: '100px',
      dataIndex: 'dataCount',
      align: 'left',
    },

    {
      title: t('business.models.run.Metrics'),
      width: 300,
      dataIndex: 'metrics',
      align: 'left',
      customRender: ({ record }) => {
        return (
          <div
            style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div style={'align-items: center'} class={'flex'}>
              {' '}
              <div>
                {record?.metrics?.metrics?.length ? (
                  <div>
                    {record?.metrics?.metrics[0].name} -- {record?.metrics?.metrics[0].value}
                  </div>
                ) : (
                  ''
                )}

                {/* <div> {record?.metrics?.metrics[0].value} </div> */}
              </div>{' '}
              {record?.metrics?.metrics.length > 1 ? (
                <div style={'margin-left:15px'}>
                  {' '}
                  <RunsCustomMetric metrics={record?.metrics?.metrics} />
                </div>
              ) : (
                ''
              )}{' '}
            </div>
          </div>
        );
      },
    },
    {
      title: t('business.models.run.createdAt'),
      dataIndex: 'createdAt',
      slots: { customRender: 'createdAt' },
      align: 'left',
      sorter: true,
      width: '160px',
      // sortDirections: ['ASC', 'DESC'],

      sortDirections: ['descend', 'ascend'],
      // sortOrder: 'ascend',
      customRender: ({ record }) => {
        return <span>{getDateTime(record.createdAt)}</span>;
      },
    },
    {
      title: t('business.models.run.status'),
      dataIndex: 'status',
      width: '100px',
      filterMultiple: false,
      align: 'left',
      filters: [
        {
          text: 'STARTED',
          value: 'STARTED',
        },
        {
          text: 'RUNNING',
          value: 'RUNNING',
        },

        {
          text: 'SUCCESS',
          value: 'SUCCESS',
        },
        {
          text: 'SUCCESS_WITH_ERROR',
          value: 'SUCCESS_WITH_ERROR',
        },
        {
          text: 'FAILURE',
          value: 'FAILURE',
        },
      ],
      filterIcon: ({ filtered }) => {
        return filtered ? activeFilterIcon : inactiveFilterIcon;
      },
      // onFilter: (value: string, record: any) => record.datasetType.indexOf(value) === 0,
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
      }
    },
  };
}

function getErrorReason(errorReason) {
  if (errorReason) {
    return JSON.parse(errorReason)[0].split(':')[1];
  }
}
