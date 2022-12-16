<template>
  <div :class="`${prefixCls}`">
    <CreateCard v-if="props.canCreate" @click="handleCreate" />
    <div
      v-for="item in props.cardList"
      :key="item.ontologyId"
      class="card"
      :class="hasBorder ? 'border' : ''"
    >
      <div class="card__container">
        <template v-if="props.activeTab == ClassTypeEnum.CLASS">
          <div class="card__title">
            <Checkbox
              v-if="cardType === CardTypeEnum.selector"
              :checked="isSelected(item.id)"
              @change="handleSelectedChange(item)"
            />
            <div class="card__title--img">
              <img :src="toolTypeImg[item.toolType]" />
            </div>
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
            <Checkbox
              v-if="cardType === CardTypeEnum.selector"
              :checked="isSelected(item.id)"
              @change="handleSelectedChange(item)"
            />
            <div class="card__title--img">
              <img :src="inputItemImg[item.inputType]" />
            </div>
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
      </div>
      <div v-if="!hasBorder" class="card__mask animate-fadeIn animate-animated">
        <div class="delete">
          <EllipsisOutlined style="color: #aaa" />
          <div class="action-list">
            <div class="item" @click.stop="handleDelete(item)">
              <img class="ml-2 mr-3" :src="deleteSvg" alt="" />
              <span class="text-lg">{{ t('common.delText') }}</span>
            </div>
          </div>
        </div>
        <div class="btn">
          <Button v-show="showPush" class="push" type="primary" block @click="handlePush(item)">
            {{ 'Push to All' }}
          </Button>
          <Button class="edit" type="primary" block @click="handleEdit(item)">
            {{ t('common.editText') }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed, inject } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { getDate } from '/@/utils/business/timeFormater';

  import { Button, Tooltip, Checkbox } from 'ant-design-vue';
  import { EllipsisOutlined } from '@ant-design/icons-vue';
  import CreateCard from '../../center/components/CreateCard.vue';

  import { ClassTypeEnum } from '/@/api/business/model/classesModel';
  import { toolTypeImg, inputItemImg, CardTypeEnum } from '../attributes/data';
  import deleteSvg from '/@/assets/icons/delete.svg';
  import CardImage from '/@/assets/images/ontology/cardImage.png';
  import { ModalConfirmCustom } from '/@/utils/business/confirm';
  import {
    pushAttributesToDatasetApi,
    deleteOntologyClassApi,
    deleteOntologyClassificationApi,
    deleteDatasetClassApi,
    deleteDatasetClassificationApi,
  } from '/@/api/business/classes';

  const { createMessage } = useMessage();
  const { t } = useI18n();
  const { prefixCls } = useDesign('cardItem');

  const props = withDefaults(
    defineProps<{
      selectedList?: any[];
      cardType?: CardTypeEnum;
      type?: 'dataset' | undefined;
      cardList: any[];
      activeTab: ClassTypeEnum;
      isCenter?: boolean;
      canCreate?: boolean;
      hasBorder?: boolean;
    }>(),
    {
      isCenter: true,
      canCreate: true,
    },
  );

  const emits = defineEmits(['edit', 'create', 'handleSelected']);
  const handleRefresh = inject('handleRefresh', Function, true);

  /** Push */
  const showPush = computed(() => {
    return props.isCenter && props.activeTab == ClassTypeEnum.CLASS;
  });
  const handlePush = (item) => {
    const relatedNum = item.datasetClassNum ?? 0;
    ModalConfirmCustom({
      title: 'Push to All',
      content: `Are you sure you want to override all ${relatedNum} related classes by current attributes`,
      okText: 'Override',
      okButtonProps: {
        type: 'primary',
        style: {
          backgroundColor: '#FCB17A',
        },
      },
      onOk: async () => {
        await pushAttributesToDatasetApi({ id: item.id });
        createMessage.success(
          `Success override all ${relatedNum} related classes by current attributes`,
        );
      },
    });
  };
  /** Edit */
  const handleEdit = (item) => {
    emits('edit', item.id);
  };

  /** Delete */
  const handleDelete = (item) => {
    ModalConfirmCustom({
      title: 'Delete Data',
      content: t('business.class.deleteSure') + ' “' + item.name + '” ?',
      okText: t('common.delText'),
      okButtonProps: { type: 'primary', danger: true },
      onOk: async () => {
        if (props.activeTab == ClassTypeEnum.CLASS) {
          try {
            if (props.isCenter) {
              await deleteOntologyClassApi({ id: item.id });
            } else {
              await deleteDatasetClassApi({ id: item.id });
            }

            const successText =
              t('business.class.class') + ` "${item.name}" ` + t('business.class.hasDeleted');
            createMessage.success(successText);

            handleRefresh();
          } catch (error) {
            console.log('error', error);
          }
        } else {
          try {
            if (props.isCenter) {
              await deleteOntologyClassificationApi({ id: item.id });
            } else {
              await deleteDatasetClassificationApi({ id: item.id });
            }

            const successText =
              t('business.class.classification') +
              ` "${item.name}" ` +
              t('business.class.hasDeleted');
            createMessage.success(successText);

            handleRefresh();
          } catch (error) {
            console.log('error', error);
          }
        }
      },
    });
  };

  const getAttributeLength = (attributes) => {
    const res = attributes ?? [];
    return res.length;
  };

  /** Create */
  const handleCreate = () => {
    emits('create');
  };

  /** Select */
  const isSelected = computed(() => (id: number) => {
    return props.selectedList?.some((item) => item.id == id);
  });
  const handleSelectedChange = (item) => {
    emits('handleSelected', item, props.activeTab);
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
      border-radius: 4px;
      background-color: #fff;
      overflow: hidden;
      font-weight: 400;
      font-size: 14px;
      color: #333;
      &.hasBorder {
        border: 1px solid #cccccc;
        border-radius: 4px;
      }
      .card__container {
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
        height: 100%;
        padding: 10px;
        .card__title {
          display: flex;
          align-items: center;
          gap: 6px;
          width: 100%;
          height: 24px;

          .card__title--img {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            img {
              width: 16px;
              height: 16px;
            }
          }

          span {
            font-size: 18px;
            padding-right: 24px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: center;
          }
          :deep(.ant-checkbox-wrapper) {
            z-index: 5;
            .ant-checkbox-inner {
              width: 20px;
              height: 20px;
            }
          }
        }

        .card__text {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          padding: 8% 0;

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
          line-height: 16px;
        }

        .card__date {
          line-height: 16px;
        }
      }

      .card__mask {
        display: none;
        align-items: flex-end;
        justify-content: center;
        position: absolute;
        width: 100%;
        height: 100%;
        padding: 10px;
        top: 0;
        left: 0;
        z-index: 3;
        background: rgba(0, 0, 0, 0.3);

        .delete {
          position: absolute;
          width: 24px;
          height: 24px;
          right: 10px;
          top: 10px;
          display: flex;
          justify-content: center;
          align-items: center;

          background-color: #f3f3f3;
          border-radius: 4px;
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
          width: 100%;
          button {
            border-radius: 6px;
          }
        }

        .btn {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-bottom: 20px;
          button {
            border-radius: 6px;
          }
          .push {
            background-color: #fcb17a;
          }
        }
      }

      &:hover {
        .card__mask {
          display: flex;
        }
      }
    }
  }
</style>
