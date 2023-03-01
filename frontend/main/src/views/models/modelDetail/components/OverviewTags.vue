<template>
  <div class="tags">
    <div v-for="item in tags" :key="item">
      <div class="image">
        <img v-if="getIcon(item)" :src="getIcon(item)" :alt="item" />
      </div>
      <div class="label"> {{ item }}</div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import Lidar from '/@/assets/images/models/lidar.svg';
  import LidarFusion from '/@/assets/images/models/lidarFusion.svg';
  import Vehicle from '/@/assets/images/models/vehicle.svg';
  import Detection from '/@/assets/images/models/detection.svg';

  const scenariosIcon = {
    vehicle: Vehicle,
    detection: Detection,
    lidar: Lidar,
    fusion: LidarFusion,
    // 原
    Lidar: Lidar,
    'Lidar fusion': LidarFusion,
    'Autonomous Vehicle': Vehicle,
    'Object Detection': Detection,
  };
  const props = defineProps<{ tagList: Nullable<string> }>();
  const tags = computed(() => {
    try {
      return props.tagList ? JSON.parse(props.tagList) : [];
    } catch {
      return props.tagList ? props.tagList.split(',') : [];
    }
  });

  // 判断包含相应的值，就显示对应的图标
  const getIcon = (value) => {
    const iconValue = value.toLowerCase();
    let res;
    for (const key in scenariosIcon) {
      if (iconValue.includes(key)) {
        res = scenariosIcon[key];
      }
    }
    return res;
  };
</script>
<style lang="less" scoped>
  .tags {
    display: flex;
    height: 32px;
    font-size: 14px;
    line-height: 16px;
    color: #57ccef;
    overflow: hidden;
    margin-left: 10px;
    margin-right: 20px;
    margin-bottom: 10px;

    & > div {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      width: auto;
      height: 100%;
      margin-left: 10px;
      border: 1px solid #57ccef;
      border-radius: 40px;
      // background-color: #f0fafe;

      .image {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 1px solid #57ccef;
        transform: translateX(-1px);
      }

      .label {
        padding: 6px 10px;
        white-space: nowrap;
      }
    }
  }
</style>
