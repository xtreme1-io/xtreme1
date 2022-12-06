<template>
  <div :class="`${prefixCls}`">
    <CreateCard @click="handleCreate" />
    <div v-for="item in props.cardList" :key="item.ontologyId" class="card">
      <template v-if="props.activeTab == ClassTypeEnum.CLASS">
        <div class="card__title">
          <img :src="toolTypeImg[item.toolType]" />
          <Tooltip placement="topLeft" :title="item.name">
            <span>{{ item.name }}</span>
          </Tooltip>
        </div>
        <div class="card__text" :style="{ backgroundColor: item.color }">
          <span>{{ item.name }}</span>
        </div>
        <div class="card__attribute">
          <span>{{ t('business.class.attributes') + '：' }}</span>
          <span>{{ getAttributeLength(item.attributes) }}</span>
        </div>
      </template>
      <template v-if="props.activeTab == ClassTypeEnum.CLASSIFICATION">
        <div class="card__title">
          <img :src="inputItemImg[item.inputType]" />
          <Tooltip placement="topLeft" :title="item.name">
            <span>{{ item.name }}</span>
          </Tooltip>
        </div>
        <div class="card__img">
          <div :style="{ backgroundImage: 'url(' + CardImage + ')' }"></div>
        </div>
      </template>
      <div class="card__date">
        <span>{{ t('business.class.createdDate') + '：' }}</span>
        <span>{{ getDate(item.createdAt) }}</span>
      </div>
      <div class="card__mask animate-fadeIn animate-animated">
        <div class="delete">
          <EllipsisOutlined style="color: #57ccef" />
          <div class="action-list">
            <div class="item" @click.stop="handleDelete(item)">
              <img class="ml-2 mr-3" :src="deleteSvg" alt="" />
              <span class="text-lg">{{ t('common.delText') }}</span>
            </div>
          </div>
        </div>
        <div class="edit">
          <Button type="primary" block @click="handleEdit(item.id)">
            {{ t('common.editText') }}
          </Button>
        </div>
      </div>
    </div>
  </div>
  <DeleteModal
    @register="deleteRegister"
    :id="itemId"
    :name="itemName"
    :activeTab="props.activeTab"
    :isCenter="props.isCenter"
  />
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useModal } from '/@/components/Modal';
  import { getDate } from '/@/utils/business/timeFormater';

  import { ClassTypeEnum } from '/@/api/business/model/ontologyClassesModel';
  import { EllipsisOutlined } from '@ant-design/icons-vue';
  import { Button, Tooltip } from 'ant-design-vue';
  import DeleteModal from './DeleteModal.vue';
  import CreateCard from '../../center/components/CreateCard.vue';
  import { toolTypeImg, inputItemImg } from '../attributes/data';
  import deleteSvg from '/@/assets/icons/delete.svg';
  import CardImage from '/@/assets/images/ontology/cardImage.png';

  const { t } = useI18n();
  const { prefixCls } = useDesign('cardItem');
  const [deleteRegister, { openModal: openDeleteModal }] = useModal();

  const props = withDefaults(
    defineProps<{
      type?: 'dataset' | undefined;
      cardList: any[];
      activeTab: ClassTypeEnum;
      isCenter?: boolean;
    }>(),
    {
      isCenter: true,
    },
  );

  const emits = defineEmits(['edit', 'create']);

  /** Edit */
  const handleEdit = (id) => {
    emits('edit', id);
  };

  /** Delete */
  const itemId = ref('');
  const itemName = ref('');
  const handleDelete = (item) => {
    itemId.value = item.id;
    itemName.value = item.name;
    openDeleteModal();
  };

  const getAttributeLength = (attributes) => {
    const res = attributes ?? [];
    return res.length;
  };

  /** Create */
  const handleCreate = () => {
    emits('create');
  };
</script>
<style lang="less" scoped>
  @import '/@/design/function/gridLayout.less';

  @prefix-cls: ~'@{namespace}-cardItem';
  .@{prefix-cls} {
    .gridLayoutCover( 232px, 20px);

    .card {
      position: relative;
      width: 100%;
      height: 100%;
      padding: 10px;
      border-radius: 4px;
      background-color: #fff;
      overflow: hidden;
      font-weight: 400;
      font-size: 14px;
      color: #333;

      .card__title {
        display: flex;
        align-items: center;
        width: 100%;
        height: 24px;
        margin-bottom: 6px;

        img {
          width: 16px;
          height: 16px;
          margin-right: 10px;
          margin-left: 4px;
        }

        span {
          font-size: 18px;
          padding-right: 24px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: center;
        }
      }

      .card__text {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        padding: 7% 0;
        margin-bottom: 6px;

        span {
          color: #ffffff;
          font-weight: 700;
          font-size: 32px;
          width: 100%;
          padding: 10px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: center;
        }
      }

      .card__img {
        margin-bottom: 6px;

        div {
          width: 100%;
          padding-top: 49%;
          background-color: #fff;
          background-position: 50%;
          background-repeat: no-repeat;
          background-size: cover;
        }
      }

      .card__attribute {
        margin-bottom: 6px;
        line-height: 16px;
      }

      .card__date {
        line-height: 16px;
      }

      &:hover {
        .card__mask {
          display: block;
        }
      }

      .card__mask {
        display: none;
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        background: rgba(0, 0, 0, 0.3);

        .delete {
          position: absolute;
          width: 24px;
          height: 24px;
          right: 6px;
          top: 6px;
          display: flex;
          justify-content: center;
          align-items: center;

          background: rgba(255, 255, 255, 0.75);
          border-radius: 3px;
          cursor: pointer;

          &:hover {
            .action-list {
              display: block;
            }
          }

          .action-list {
            display: none;
            position: absolute;
            width: 160px;
            height: 48px;
            right: 6px;
            top: 22px;
            padding: 6px 0;
            background: #fff;
            box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.15);
            border-radius: 6px;
            z-index: 200;

            .item {
              cursor: pointer;
              width: 160px;
              height: 36px;
              line-height: 36px;
              display: inline-flex;
              align-items: center;

              &:hover {
                background: rgba(87, 204, 239, 0.15);
              }
            }

            &:hover {
              display: block;
            }
          }
        }

        .sync {
          position: absolute;
          left: 20px;
          right: 20px;
          bottom: 60px;
        }

        .edit {
          position: absolute;
          left: 20px;
          right: 20px;
          bottom: 20px;
        }
      }
    }
  }
</style>
