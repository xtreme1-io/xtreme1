<template>
  <div :class="`${prefixCls}`">
    <CreateCard @click="handleCreate" />
    <Card
      v-for="item in props.cardList"
      :key="item.id"
      :bordered="false"
      class="content"
      size="small"
      hoverable
    >
      <template #title>
        <Tooltip placement="topLeft" :title="item.name">
          <div class="card__title">{{ item.name }}</div>
        </Tooltip>
      </template>
      <template #extra>
        <!-- 0.3版本取消默认 -->
        <!--  v-if="!item.isDefault" -->
        <div class="more">
          <Icon icon="akar-icons:more-horizontal" />
          <div class="action-list">
            <div class="item" @click.stop="handleRename(item)">
              <SvgIcon name="rename" :size="16" class="mr-4px" />
              <span class="text-lg">{{ t('common.renameText') }}</span>
            </div>
            <div class="item" @click.stop="handleDelete(item)">
              <SvgIcon name="delete" :size="16" class="mr-4px" />
              <span class="text-lg">{{ t('common.delText') }}</span>
            </div>
          </div>
        </div>
      </template>
      <div class="img" @click="handleRouter(item)">
        <div :style="{ backgroundImage: 'url(' + CardImage + ')' }"></div>
      </div>
      <div class="type">
        <span> {{ t('business.ontology.card.type') }}: </span>
        <span>{{ item.type }}</span>
      </div>
      <div class="count">
        <span> {{ t('business.ontology.card.classesCount') }}: </span>
        <span>{{ item.classNum ?? 0 }}</span>
      </div>
      <div class="time">
        <span> {{ t('business.ontology.card.createdTime') }}: </span>
        <span> {{ getDate(item.createdAt) }}</span>
      </div>
    </Card>
  </div>
  <!-- Modal -->
  <RenameModal @register="renameRegister" :id="itemId" :name="itemName" />
  <DeleteModal @register="deleteRegister" :id="itemId" :name="itemName" />
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { OntologyListItem } from '/@/api/business/model/ontologyModel';
  import { useGo } from '/@/hooks/web/usePage';
  import { useModal } from '/@/components/Modal';
  import { RouteEnum } from '/@/enums/routeEnum';
  import { getDate } from '/@/utils/business/timeFormater';
  // components
  import { Card, Tooltip } from 'ant-design-vue';
  import Icon, { SvgIcon } from '/@/components/Icon';
  import RenameModal from './RenameModal.vue';
  import DeleteModal from './DeleteModal.vue';
  import CreateCard from './CreateCard.vue';
  // icons
  import CardImage from '/@/assets/images/ontology/cardImage.png';
  import { setDatasetBreadcrumb } from '/@/utils/business';

  const { prefixCls } = useDesign('ontologyCard');
  const { t } = useI18n();
  const go = useGo();
  const [renameRegister, { openModal: openRenameModal }] = useModal();
  const [deleteRegister, { openModal: openDeleteModal }] = useModal();

  const props = defineProps<{
    cardList: OntologyListItem[];
  }>();

  // router to class
  const handleRouter = (item) => {
    setDatasetBreadcrumb(item.name);
    go(`${RouteEnum.ONTOLOGY}/class?id=${item.id}`);
  };
  // rename
  const itemId = ref<number | string>(0);
  const itemName = ref<string>('');
  const handleRename = (item) => {
    itemId.value = item.id;
    itemName.value = item.name;
    openRenameModal(true, { name: item.name, type: item.type });
  };
  // delete
  const handleDelete = async (item) => {
    itemId.value = item.id;
    itemName.value = item.name;
    openDeleteModal();
  };

  /** Create */
  const emits = defineEmits(['create']);
  const handleCreate = () => {
    emits('create');
  };
</script>

<style lang="less" scoped>
  @import '/@/design/function/gridLayout.less';

  @prefix-cls: ~'@{namespace}-ontologyCard';
  .@{prefix-cls} {
    @height: 222px;
    .gridLayoutCover(285px, 20px);
    padding: 15px 20px;
    .create-card {
      min-height: @height;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      // height: 222px;
      background-color: #ffffff;
      border: 2px dashed #cccccc;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;
      &:hover {
        background-color: #f9fcff;
        border-color: rgba(96, 169, 254, 0.8);
      }
    }

    &:deep(.ant-card) {
      width: 100%;
      // height: @height;
      padding: 10px;
      border-radius: 4px;
      font-size: 14px;
      line-height: 16px;
      // cursor: pointer;

      .ant-card-head {
        padding: 0;
        border-bottom: none;
        height: 24px;
        min-height: 24px;
        line-height: 24px;

        .ant-card-head-wrapper {
          height: 24px;
          min-height: 24px;

          .card__title {
            height: 24px;
            width: 255px;
            font-weight: 500;
            font-size: 16px;
            color: #333;
            line-height: 21px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .more {
            position: relative;
            cursor: pointer;

            &:hover {
              .anticon {
                color: @primary-color;
              }
              .action-list {
                display: block;
              }
            }

            .action-list {
              display: none;
              position: absolute;
              padding: 6px 0px;
              right: 0;
              background: #ffffff;
              box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.15);
              border-radius: 12px;
              z-index: 200;

              .item {
                cursor: pointer;
                width: 160px;
                height: 36px;
                line-height: 36px;
                display: inline-flex;
                align-items: center;
                padding-left: 6px;
                span {
                  font-size: 14px;
                  line-height: 16px;
                  color: #666666;
                }

                &:hover {
                  background: rgba(87, 204, 239, 0.15);
                }
              }

              &:hover {
                display: block;
              }
            }
          }
        }
      }

      .ant-card-body {
        padding: 0;

        .img {
          margin: 6px 0;

          div {
            // height: 106px;
            width: 100%;
            padding-top: 35%;
            background-position: 50%;
            background-repeat: no-repeat;
            background-size: cover;
          }
          // img {
          //   width: 100%;
          //   height: 100%;
          // }

          &:hover {
            cursor: pointer;
          }
        }

        .type,
        .count,
        .time {
          color: #333;
          font-size: 14px;
          line-height: 16px;
          height: 16px;
          margin-bottom: 6px;
        }
      }
    }
  }
</style>
