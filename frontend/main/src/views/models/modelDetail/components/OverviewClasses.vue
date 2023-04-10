<template>
  <!-- 平铺 -->
  <div v-if="!isGroup" class="class--tile">
    <div v-for="item in currentClasses" :key="item.name" @click="handleOpenInfo(item)">
      <template v-if="props.datasetType != datasetTypeEnum.IMAGE">
        <img v-if="item.icon" :src="item.icon" />
      </template>
      <span>{{ item.name }}</span>
    </div>
  </div>
  <!-- 分组 -->
  <div v-else class="class--group">
    <div v-for="(item, key) in (groupClass as any)" :key="key">
      <div class="left" @click.stop="handleOpenInfo(key)">
        <img v-if="item[0].typeIcon" :src="item[0].typeIcon" />
        <span>{{ key }}</span>
      </div>
      <div class="right">
        <span v-for="child in item" :key="child.name" @click="handleOpenInfo(key)">
          {{ child.name }}
        </span>
      </div>
    </div>
  </div>
  <!-- <OverviewClassesInfo @register="registerModal" :groupClass="props.classes" /> -->
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';
  import { IClasses } from './typing';
  // import OverviewClassesInfo from './OverviewClassesInfo.vue';
  import { useModal } from '/@/components/Modal';
  import { groupBy } from 'lodash';

  const props = withDefaults(
    defineProps<{ isGroup: boolean; classes: IClasses[]; datasetType: datasetTypeEnum }>(),
    {
      classes: (): IClasses[] => [],
    },
  );

  // 判断是否分组
  const isGroup = computed<boolean>(() => {
    return !!props.isGroup;
  });
  // 直接返回数据
  const currentClasses = computed(() => {
    return props.classes;
  });

  const groupClass = computed(() => {
    return groupBy(props.classes, 'typeName');
  });

  /** Modal */
  const [registerModal, { openModal }] = useModal();
  const handleOpenInfo = (record) => {
    // const classInfo = Array.isArray(item) ? item[0] : item;
    const index = props.classes.findIndex((item) => item.id === record.id);

    openModal(true, { index });
  };
</script>
<style lang="less" scoped>
  .class--tile {
    // max-width: 1200px;
    width: calc(100% - 20px);
    display: grid;
    grid-template-columns: repeat(auto-fit, 160px);
    grid-template-rows: 98px;
    grid-auto-rows: 98px;
    gap: 20px;
    margin-bottom: 20px;
    padding-left: 20px;

    & > div {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 8px;
      border: 1px solid #cccccc;
      border-radius: 10px;
      padding: 20px;
      cursor: pointer;

      img {
        width: 40px;
        height: 40px;
      }

      span {
        line-height: 16px;
        color: #333;
        text-transform: capitalize;
        text-align: center;
      }
    }
  }

  .class--group {
    width: calc(100% - 20px);
    display: grid;
    grid-template-columns: repeat(2, 50%);
    grid-template-rows: auto;
    grid-auto-rows: minmax(110px, auto);
    gap: 20px;
    margin-bottom: 20px;
    padding-left: 20px;

    & > div {
      display: flex;
      border: 1px solid #ccc;
      border-radius: 10px;
      color: #333;
      overflow: hidden;

      .left {
        width: 100px;
        min-height: 108px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 8px;
        background-color: #e6f7fd;
        cursor: pointer;

        img {
          width: 40px;
          height: 40px;
        }

        span {
          font-weight: 500; //font-weight: 600;

          font-size: 14px;
          color: #333;
          text-transform: capitalize;
        }
      }

      .right {
        flex: 1;
        display: flex;
        flex-wrap: wrap;
        align-content: center;
        justify-content: flex-start;
        // display: grid;
        // grid-template-columns: auto-fit;
        gap: 10px;
        padding: 10px;

        span {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 24px;
          box-sizing: content-box;
          font-size: 14px;
          color: #333;
          white-space: nowrap;
          cursor: pointer;

          width: auto;
          padding: 2px 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          background-color: rgba(204, 204, 204, 0.1);
        }
      }
    }
  }
</style>
