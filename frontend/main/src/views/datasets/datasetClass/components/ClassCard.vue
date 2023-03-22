<template>
  <div :class="`${prefixCls}`">
    <div class="mask">
      <div class="more">
        <Icon icon="fluent:more-horizontal-32-regular" />
        <div class="action-list">
          <div class="action" @click="handleDel">
            <span class="menu-text">{{ t('common.delText') }}</span>
            <Icon size="20" icon="mdi:delete-forever" />
          </div>
        </div>
      </div>
      <div class="wrapper">
        <div class="btn">
          <Button type="primary" block @click="handleEdit">Edit</Button>
        </div>
      </div>
    </div>
    <div class="wrapper">
      <div class="title">
        <img :src="imgFactory(record)" alt="" />
        {{ record.name }}
      </div>
      <div class="img">
        {{ record.name }}
      </div>
      <div class="info">
        <div
          class="field"
          v-for="item in JSON.parse(record.attributes) && JSON.parse(record.attributes).length > 3
            ? JSON.parse(record.attributes).slice(0, 3)
            : JSON.parse(record.attributes)"
          :key="item.name"
        >
          <img v-if="inputItemImg[item.type]" :src="inputItemImg[item.type]" alt="" />
          {{ item.name }}
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import Icon from '/@/components/Icon';
  import { Button } from '/@@/Button';
  import { defineProps, defineEmits } from 'vue';
  import { inputItemImg } from './formSchemas';
  import { ClassItem } from '/@/api/business/model/classModel';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { deleteClassApi } from '/@/api/business/class';
  import { imgFactory } from '/@/utils/business/classUtil';
  const { prefixCls } = useDesign('classCard');

  const { t } = useI18n();

  type Props = {
    record: ClassItem;
  };
  const props = defineProps<Props>();
  const emits = defineEmits(['fetchList', 'handleDetail']);
  const handleDel = async () => {
    await deleteClassApi({ id: props.record.id });
    emits('fetchList');
  };
  const handleEdit = async () => {
    emits('handleDetail', props.record.id);
  };
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-classCard';
  .@{prefix-cls} {
    position: relative;
    float: left;
    margin: 0 5px;
    width: 168px;
    height: 168px;
    background: white;
    margin-bottom: 10px;
    border-radius: 4px;

    .action-list {
      display: none;
      position: absolute;
      top: -5px;
      right: -110px;
      background: white;
      width: 110px;
      box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.15);
      border-radius: 8px;
      padding-top: 8px;
      padding-bottom: 8px;

      &:hover {
        display: block;
      }

      .action {
        cursor: pointer;
        padding-left: 10px;
        padding-right: 10px;
        display: flex;
        justify-content: space-between;
        line-height: 30px;
        align-items: center;
        color: #aaa;

        .menu-text {
          font-size: 14px;
          color: #333;
        }

        &:hover {
          background: rgba(87, 204, 239, 0.15);
        }
      }
    }

    &:hover {
      .mask {
        display: flex;
      }
    }

    .mask {
      display: none;
      // display: flex;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      position: absolute;
      flex-direction: column;
      z-index: 100;

      &:hover {
        display: flex;
      }

      .more {
        position: absolute;
        right: 0px;
        padding-right: 10px;
        top: 10px;
        color: @primary-color;

        &:hover .action-list {
          display: block;
        }
      }

      .wrapper {
        width: 100%;
        height: 100%;

        .btn {
          height: 100%;
          display: flex;
          margin: 0 auto;
          width: 128px;
          align-items: center;
        }
      }
    }

    .wrapper {
      padding: 6px 6px 8px;
    }

    .title {
      display: flex;
      align-items: center;
      margin-bottom: 6px;

      img {
        width: 24px;
        height: 24px;
        margin-right: 8px;
      }
    }

    .img {
      position: relative;
      width: 156px;
      height: 70px;
      background: #86affe;
      color: white;
      text-align: center;
      font-size: 18px;
      line-height: 70px;
      // img {
      //   width: 158px;
      //   height: 70px;
      // }
      // background-image: url(/@/assets/images/placeImg.png);
      // background-position: center center;
    }

    .info {
      font-size: 12px;
      margin-top: 2px;

      .field {
        margin-top: 1px;
        display: flex;
        align-items: center;

        img {
          margin-right: 5px;
          width: 14px;
          height: 14px;
        }
      }
    }
  }
</style>
