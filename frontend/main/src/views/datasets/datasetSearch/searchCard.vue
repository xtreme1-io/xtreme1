<template>
  <div ref="cardContainer" :class="`${prefixCls} image-loading`">
    <!-- LIDAR pointCloud img -->
    <template
      v-if="[datasetTypeEnum.LIDAR_FUSION, datasetTypeEnum.LIDAR_BASIC].includes(info.type)"
    >
      <img
        :style="{ transform: state.imgTransform }"
        class="pointCloudImg"
        @error="onHandleImgLoad"
        @load="onHandleImgLoad"
        :src="getPlaceImg()"
        alt=""
      />
      <svg ref="svg" class="easy-pc" fill="transparent" stroke-width="1" stroke="currentColor">
        <polygon
          v-for="item in iState.pcObject"
          :key="item.id"
          :stroke="item.color"
          :points="item.points"
        />
      </svg>
    </template>
    <!-- LIDAR_FUSION images  -->
    <template v-if="datasetTypeEnum.LIDAR_FUSION === info.type">
      <div class="image-pc">
        <img
          class="img-2d"
          :style="{ transform: state.transform }"
          @load="update2d"
          :src="pcActiveImage?.url"
        />
        <svg class="easy-svg" fill="transparent" stroke-width="1" stroke="currentColor">
          <polygon
            v-for="_item in state.object2d"
            :key="_item.id"
            :stroke="_item.color"
            :points="_item.points"
          />
        </svg>
        <div @click.stop="() => onChange(-1)" :class="['handle-icon left']">
          <LeftCircleOutlined />
        </div>
        <div @click.stop="() => onChange(+1)" :class="['handle-icon right']">
          <RightCircleOutlined />
        </div>
        <div class="info-img2d">{{ state.imgIndex + 1 }}</div>
        <div class="info-msg" v-if="!state.object2d.length">No Camera objects</div>
      </div>
    </template>
    <!-- Image -->
    <template v-if="datasetTypeEnum.IMAGE === info.type">
      <img
        class="image"
        alt=""
        :style="{ transform: state.transform }"
        @load="updateImage"
        @error="onHandleImgLoad"
        :src="pcActiveImage?.url"
      />
      <svg class="easy-svg" style="color: red" stroke-width="1" stroke="white" fill="transparent">
        <template v-for="item in iState.imageObject">
          <polyline
            v-if="item.type === 'POLYLINE'"
            :stroke="item.color"
            :key="item.uuid"
            :points="item.points"
          />
          <template v-else-if="item.hole.length > 0">
            <mask :id="item.uuid" :key="item.uuid">
              <polygon :points="item.points" fill="currentColor" />
              <polygon v-for="(_item, _idx) in item.hole" fill="#000" :key="_idx" :points="_item" />
            </mask>

            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              :fill="item.color || '#fff'"
              :key="item.uuid"
              :style="{ mask: `url(#${item.uuid})` }"
            />
          </template>
          <polygon v-else :key="item.type + item.uuid" :stroke="item.color" :points="item.points" />
        </template>
      </svg>
    </template>
    <div class="card-info">
      <div v-if="showInfo" class="info-dataName">Dataset: {{ data?.datasetName || '-' }}</div>
      <div v-if="showInfo" class="info-dataName">Class: {{ getObjectClass() || '-' }}</div>
      <div class="info-dataName">Data: {{ data?.name || '-' }}</div>
      <div class="info-objectName">Object: {{ getObjectName() || '-' }}</div>
    </div>
    <div class="operation"> <slot></slot></div>
  </div>
</template>
<script lang="ts" setup>
  import {
    DatasetItem,
    DatasetListItem,
    datasetTypeEnum,
  } from '/@/api/business/model/datasetModel';
  import { useSearchCard } from '../datasetContent/components/useCardObject';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { LeftCircleOutlined, RightCircleOutlined } from '@ant-design/icons-vue';
  // import { ref, reactive } from 'vue';
  const { prefixCls } = useDesign('searchCard');

  type IProps = {
    info: DatasetListItem;
    data: DatasetItem;
    showInfo?: boolean;
    // object2D: any;
    object: any;
  };
  const props = defineProps<IProps>();
  const {
    svg,
    iState,
    state,
    getPlaceImg,
    updateImage,
    cardContainer,
    update2d,
    onHandleImgLoad,
    onChange,
    pcActiveImage,
  } = useSearchCard(props);
  const getObjectName = () => {
    const obj = Array.isArray(props.object) ? props.object[0] : props.object;
    return obj?.classAttributes?.trackName;
  };
  const getObjectClass = () => {
    const obj = Array.isArray(props.object) ? props.object[0] : props.object;
    const info = obj?.classAttributes || {};
    return info.className || info.classType || info.mete?.className || info.mete?.classType;
  };
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-searchCard';
  .@{prefix-cls} {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    background-color: #ededed;
    transform: translateZ(0);
    .pointCloudImg {
      width: 100%;
      height: 100%;
      object-fit: cover;
      pointer-events: none;
    }
    .easy-pc {
      // pointer-events: none;
      color: red;
      position: absolute;
      width: 100%;
      aspect-ratio: 1;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
      pointer-events: none;
    }
    .image {
      position: absolute;
      object-fit: cover;
      width: 100%;
      height: 100%;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
    .easy-svg {
      pointer-events: none;
      position: absolute;
      width: 100%;
      height: 100%;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
    .image-pc {
      position: absolute;
      right: 0;
      top: 0;
      width: 90px;
      height: 70px;
      overflow: hidden;
      background-color: transparent;
      z-index: 1;
      color: white;
      .img-2d {
        position: absolute;
        object-fit: cover;
        width: 100%;
        height: 100%;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }
      .handle-icon {
        pointer-events: all;
        &.left {
          left: 0;
        }
        &.right {
          right: 0;
        }
        &:hover {
          opacity: 1;
        }
        opacity: 0.7;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        padding: 4px;
        color: white;
      }
      .info-img2d {
        position: absolute;
        top: 0;
        right: 0;
        text-align: center;
        color: #f7f7f7;
        font-size: 12px;
        zoom: 0.8;
        padding: 0 4px;
        background: #60a9fe;
        border-bottom-left-radius: 6px;
        height: 16px;
      }
      .info-msg {
        padding: 0 14px;
        position: absolute;
        top: 0;
        left: 0;
        color: white;
        font-size: 12px;
        text-align: center;
        width: 100%;
        height: 100%;
        pointer-events: none;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #00000042;
        zoom: 0.7;
      }
    }
    .card-info {
      position: absolute;
      bottom: 0;
      left: 0;
      color: white;
      padding: 6px;
      font-size: 12px;
      max-width: 100%;
      background: #00000036;
      .info-dataName,
      .info-objectName {
        height: 16px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        width: 100%;
      }
    }
    .operation {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      top: 0;
      opacity: 0;
      pointer-events: all;
      display: flex;
      justify-content: center;
      align-items: center;
      &:hover {
        animation-name: operationHover;
        animation-duration: 0.5s;
        animation-fill-mode: forwards;
      }
    }

    @keyframes operationHover {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }
  }
</style>
