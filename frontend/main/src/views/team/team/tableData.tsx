import { BasicColumn } from '/@/components/Table/src/types/table';
import Icon, { SvgIcon } from '/@/components/Icon';
import { Button } from '/@@/Button';
import ava from '/@/assets/images/common/default-ava.png';
import { ProfileAvatar } from '/@/components/BasicCustom/ProfileAvatar';

// const { t } = useI18n();
export function getBasicColumns(funcObj: {
  handleRemoveModal: (r: string[]) => void;
}): BasicColumn[] {
  // const userStore = useUserStore();
  // const userInfo = userStore.getUserInfo;
  return [
    {
      title: 'Member',
      dataIndex: 'nickname',
      width: 300,
      customRender: ({ record }) => {
        return (
          <div class="flex">
            <div class="mr-2 ava">
              <ProfileAvatar size="24" avatarUrl={record.avatarUrl} nickname={record.nickname} />
            </div>
            <div class="text-left info">
              <div class=" text-primary">{record.nickname}</div>
              <div>{record.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Email',
      dataIndex: 'username',
    },
    {
      title: 'Actions',
      customRender: ({ record }) => {
        return (
          <div
            class="inline-flex items-center cursor-pointer"
            onClick={() => {
              funcObj.handleRemoveModal(record);
            }}
          >
            <SvgIcon class="align-middle" size="18" name="remove-from-team" />
            <span class="ml-2 align-middle"> Remove User</span>
          </div>
        );
      },
    },
  ];
}

export function getBasicShortColumns(): BasicColumn[] {
  return [
    {
      title: 'ID',
      width: 150,
      dataIndex: 'id',
      sorter: true,
      sortOrder: 'ascend',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      width: 120,
    },
    {
      title: '地址',
      dataIndex: 'address',
    },
    {
      title: '编号',
      dataIndex: 'no',
      width: 80,
    },
  ];
}

export function getApproveColumns(funcObj: {
  handleApprove: (r: string[], type) => void;
}): BasicColumn[] {
  return [
    {
      title: 'Name',
      dataIndex: 'nickname',
      customRender: ({ record }) => (
        <div class="inline-flex items-center">
          <Icon size="20" icon="ion:person-circle" style="color:#57CCEF" />
          <span class="ml-2">Applicant：</span>
          <span>{record.nickname}</span>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      customRender: ({ record }) => (
        <div class="inline-flex items-center">
          <Icon size="20" icon="ic:sharp-email" style="color:#57CCEF" />
          <span class="ml-2">Email：</span>
          <span>{record.email}</span>
        </div>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      width: 200,
      customRender: ({ record }) => {
        return (
          <div>
            <Button
              danger
              class="mr-2"
              onClick={() => {
                funcObj.handleApprove([record.id], 1);
              }}
            >
              Accept
            </Button>
            <Button
              danger
              onClick={() => {
                funcObj.handleApprove([record.id], 0);
              }}
            >
              Reject
            </Button>
          </div>
        );
      },
    },
  ];
}
