<template>
  <div :class="`${prefixCls}`">
    <div
      class="ontology__item"
      v-for="item in props.cardList"
      :key="item.id"
      :class="[props.activeCard == item.id ? 'active' : '']"
      @click="handleClick(item)"
    >
      <div class="ontology__item--img">
        <div :style="{ backgroundImage: 'url(' + CardImage + ')' }"></div>
      </div>
      <div class="ontology__item--content">
        <div class="header">
          <div class="header-title">
            <Tooltip placement="topLeft" :title="item.name">
              <div class="card__title">{{ item.name }}</div>
            </Tooltip>
          </div>
          <div class="header-icon">
            <Dropdown placement="bottomRight">
              <Icon style="cursor: pointer; color: #aaa" icon="gridicons:ellipsis" :size="18" />
              <template #overlay>
                <Menu>
                  <Menu.Item @click.stop="handleRename(item)">
                    <div class="flex gap-10px items-center">
                      <SvgIcon class="icon" name="rename" />
                      <span class="text-lg">{{ t('common.renameText') }}</span>
                    </div>
                  </Menu.Item>
                  <Menu.Item @click.stop="handleDelete(item)">
                    <div class="flex gap-10px items-center">
                      <SvgIcon class="icon" name="delete" />
                      <span class="text-lg">{{ t('common.delText') }}</span>
                    </div>
                  </Menu.Item>
                </Menu>
              </template>
            </Dropdown>
          </div>
        </div>
        <div class="count">
          <span> {{ t('business.ontology.card.classesCount') }}: </span>
          <span>{{ item.classNum ?? 0 }}</span>
        </div>
        <div class="time">
          <span> {{ t('business.ontology.card.createdTime') }}: </span>
          <span> {{ getDate(item.createdAt) }}</span>
        </div>
      </div>
      <div class="ontology__item--type"> {{ item.type }} </div>
    </div>
  </div>
  <!-- 弹窗 -->
  <RenameModal @register="renameRegister" :id="itemId" :name="itemName" />
  <DeleteModal @register="deleteRegister" :id="itemId" :name="itemName" />
</template>

<script lang="ts" setup>
  import { ref, defineEmits } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { OntologyListItem } from '/@/api/business/model/ontologyModel';
  import { useGo } from '/@/hooks/web/usePage';
  import { useModal } from '/@/components/Modal';
  import { RouteEnum } from '/@/enums/routeEnum';
  import { getDate } from '/@/utils/business/timeFormater';
  // 组件
  import { Tooltip, Menu, Dropdown } from 'ant-design-vue';
  import Icon, { SvgIcon } from '/@/components/Icon';
  import RenameModal from './RenameModal.vue';
  import DeleteModal from './DeleteModal.vue';
  // 图标
  import CardImage from '/@/assets/images/ontology/cardImage.png';
  import { setDatasetBreadcrumb } from '/@/utils/business';

  const { prefixCls } = useDesign('ontologyCard');
  const { t } = useI18n();
  const go = useGo();
  const [renameRegister, { openModal: openRenameModal }] = useModal();
  const [deleteRegister, { openModal: openDeleteModal }] = useModal();

  const props = defineProps<{
    cardList: OntologyListItem[];
    isOntologyCenter?: boolean;
    activeCard?: string | number;
  }>();
  const emits = defineEmits(['update:activeCard']);

  // 点击卡片 ->  携带id跳转到 classes 页面
  const handleClick = (item: OntologyListItem) => {
    if (props.isOntologyCenter) {
      setDatasetBreadcrumb(item.name);
      go(`${RouteEnum.ONTOLOGY}/class?id=${item.id}&teamId=${item.teamId}`);
    } else {
      emits('update:activeCard', item.id);
    }
  };
  // 重命名
  const itemId = ref<number | string>(0);
  const itemName = ref<string>('');
  const handleRename = (item) => {
    itemId.value = item.id;
    itemName.value = item.name;
    openRenameModal(true, { name: item.name, type: item.type });
  };
  // 删除
  const handleDelete = async (item) => {
    itemId.value = item.id;
    itemName.value = item.name;
    openDeleteModal();
  };
</script>

<style lang="less" scoped>
  @import '/@/design/function/gridLayout.less';

  @prefix-cls: ~'@{namespace}-ontologyCard';
  .@{prefix-cls} {
    @height: 222px;
    .gridLayoutCover( 285px, 20px);
    padding: 15px 20px;

    .ontology__item {
      position: relative;
      display: flex;
      flex-direction: column;
      border-radius: 8px;
      // border: 2px solid transparent;
      box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.1);
      background-color: transparent;
      overflow: hidden;

      &:hover {
        cursor: pointer;
      }

      &.active {
        box-shadow: 0 0 0 3px @primary-color;
        // border: 2px solid @primary-color;
      }

      &--img {
        div {
          width: 100%;
          padding-top: 50%;
          background-position: 50%;
          background-repeat: no-repeat;
          background-size: cover;
        }
      }

      &--content {
        flex: 1;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        background: #fff;

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;

          &-title {
            height: 24px;
            width: 255px;
            font-weight: 500;
            font-size: 18px;
            line-height: 21px;
            color: #333;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        .count,
        .time {
          color: #666;
          font-size: 14px;
          line-height: 16px;
          height: 16px;
          margin-bottom: 6px;

          span {
            &:first-child {
              color: #aaa;
            }
          }
        }
      }

      &--type {
        position: absolute;
        top: 10px;
        right: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 2px 8px;
        background: #57ccef;
        border-radius: 4px;
        font-size: 12px;
        line-height: 14px;
        color: #ffffff;
      }
    }
  }
</style>
