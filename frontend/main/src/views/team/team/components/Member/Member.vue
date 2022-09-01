<template>
  <div :class="`${prefixCls}`">
    <Modal
      :title="t('business.team.removeMember')"
      @register="registerRemoveModal"
      :ok-button-props="{ danger: true }"
      :okText="t('common.delText')"
      @ok="handleRemove"
    >
      <div class="text-center" :style="{ lineHeight: '210px' }">
        {{ t('business.team.removeConfirmText') }} {{ user?.user?.nickname }}
      </div>
    </Modal>
    <div class="flex justify-between mb-3 items-center">
      <div>Member</div>
      <div>
        <Input
          autocomplete="off"
          v-model:value="name"
          :placeholder="t('business.ontology.searchForm.searchItems')"
        >
          <template #suffix>
            <Icon icon="ant-design:search-outlined" style="color: #aaa" size="16" />
          </template>
        </Input>
      </div>
    </div>
    <div class="member-content">
      <div class="table">
        <div class="table-wrapper">
          <BasicTable @register="registerTable" />
        </div>
      </div>
      <!-- <div class="sider">
       
      </div> -->
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, unref, onBeforeMount, onUnmounted, reactive, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicTable, useTable } from '/@/components/Table';
  import { getBasicColumns } from '../../tableData';
  import Modal from '/@@/Modal/index.vue';
  import { useDesign } from '/@/hooks/web/useDesign';

  import { useModal } from '/@/components/Modal';
  import { removeMemberActionApi, teamListApi } from '/@/api/business/team';
  import { TeamListParams, TeamUser } from '/@/api/business/model/teamModel';
  import { Input } from 'ant-design-vue';
  import Icon from '/@/components/Icon';
  const { t } = useI18n();
  const [registerRemoveModal, { openModal: openRemoveModal, closeModal: closeRemoveModal }] =
    useModal();
  const { prefixCls } = useDesign('team-member');

  const name = ref<string | undefined>(undefined);
  const user = ref<TeamUser>();
  // const seletedRole = ref();

  onBeforeMount(async () => {});

  let filterForm = reactive({
    nickname: name,
  });
  let timeout;
  watch(filterForm, () => {
    /* ... */
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      reload();
    }, 400);
  });

  const handleRemoveModal = (record) => {
    user.value = record;
    openRemoveModal();
  };

  // const resetFilter = () => {
  //   filterForm.nickname = '';
  // };

  let interval;

  onUnmounted(async () => {
    clearInterval(interval);
  });

  const handleRemove = async () => {
    const data = unref(user);
    if (data) {
      await removeMemberActionApi({
        userIds: [data.id],
      });
    }
    closeRemoveModal();
    reload();
  };

  const [registerTable, { reload }] = useTable({
    canResize: false,
    api: teamListApi,
    columns: getBasicColumns({
      handleRemoveModal,
    }),
    beforeFetch: (params: TeamListParams) => {
      return {
        ...params,
        ...filterForm,
      };
    },
    rowKey: 'id',
    showIndexColumn: false,
    showTableSetting: false,
    bordered: false,
    pagination: true,
  });
</script>
<style lang="less" scoped>
  @import '../../index.less';

  .sider {
    :deep(.ant-select) {
      margin-top: 8px;
      width: 100%;

      .ant-select-selector {
        // color: red;
        padding-left: 11px;
        padding-top: 2px;
        padding-bottom: 2px;
        gap: 2px 4px;

        .ant-select-selection-item {
          width: 75px;
          position: relative;
          height: 20px;
          align-items: center;
          background-color: unset;
          border: unset;
          margin: 0;
          padding-left: 6px;

          &:nth-child(5) {
            .ant-select-selection-item-content {
              width: auto;
            }
          }

          .ant-select-selection-item-content {
            z-index: 5;
            width: 50px;

            .tag-item {
              height: 20px;

              .node-name {
                height: 20px;
                z-index: 2;
                border-radius: 30px;
                color: #fff;
                font-size: 12px;
                line-height: 20px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }

              .empty {
                width: 75px;
                height: 20px;
                border-radius: 30px;
                position: absolute;
                right: 0;
                z-index: 1;
              }
            }
          }

          .ant-select-selection-item-remove {
            z-index: 5;
            color: #ffffff;
          }
        }
      }
    }
  }
</style>
<style lang="less">
  .treeSelectTag {
    .ant-select-tree {
      .category__node,
      .tag__node {
        & > .ant-select-tree-node-content-wrapper {
          width: 100%;
          display: inline-flex;
          align-items: center;

          &:hover {
            background-color: transparent;
          }

          .node-name {
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            height: 24px;
            padding: 0px 10px;
            border-radius: 30px;
            color: #fff;
            font-size: 14px;
            line-height: 16px;
          }
        }
      }
    }
  }
</style>
