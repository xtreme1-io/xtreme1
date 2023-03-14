<template>
  <div :class="`${prefixCls}`">
    <div v-for="(item, index) in currentList" :key="index" class="card" @click="handleRouter(item)">
      <div class="card__header">
        <div
          class="card__header--type"
          v-if="item.datasetType"
          :class="[item.datasetType == datasetTypeEnum.IMAGE ? 'image' : 'lidar']"
        >
          {{
            item.datasetType == datasetTypeEnum.IMAGE
              ? t('business.dataset.image')
              : t('business.ontology.modal.datasetType.lidar')
          }}
        </div>
        <Tooltip placement="topLeft" :title="item.name">
          <div class="card__header--title"> {{ item.name }} </div>
        </Tooltip>
      </div>
      <div class="card__picture">
        <div v-if="item.img" :style="{ backgroundImage: 'url(' + imageModelImg + ')' }"></div>
        <div
          v-else-if="item.datasetType == datasetTypeEnum.IMAGE"
          :style="{ backgroundImage: 'url(' + imageModelImg + ')' }"
        ></div>
        <div
          v-else-if="item.datasetType == datasetTypeEnum.LIDAR_BASIC"
          :style="{ backgroundImage: 'url(' + LidarModelImg + ')' }"
        ></div>
        <div
          v-else-if="item.datasetType == datasetTypeEnum.LIDAR_FUSION"
          :style="{ backgroundImage: 'url(' + LidarModelImg + ')' }"
        ></div>
        <div v-else :style="{ backgroundImage: 'url(' + imageModelImg + ')' }"></div>
      </div>
      <div class="card__count">
        <span>{{ item.runCount ?? 0 }}</span>
        <span>{{ ' ' + t('business.models.runs') }}</span>
      </div>
      <div class="card__tags">
        <div v-for="tag in item.scenario" :key="tag">
          {{ tag }}
        </div>
      </div>
      <!-- <div
        class="card__type"
        v-if="item.datasetType"
        :class="[item.datasetType == datasetTypeEnum.IMAGE ? 'image' : 'lidar']"
      >
        {{ item.datasetType }}
      </div> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useGo } from '/@/hooks/web/usePage';
  import { RouteChildEnum } from '/@/enums/routeEnum';
  import { parseParam } from '/@/utils/business/parseParams';
  // 图标
  import { Tooltip } from 'ant-design-vue';
  import imageModelImg from '/@/assets/images/models/imageModel.png';
  import LidarModelImg from '/@/assets/images/models/lidarModel.png';
  // 接口
  import { ModelListItem } from '/@/api/business/model/modelsModel';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';

  const { prefixCls } = useDesign('modelsCard');
  const { t } = useI18n();
  const go = useGo();

  const props = defineProps<{
    list: ModelListItem[];
  }>();

  const currentList = computed(() => {
    return props.list.map((item) => {
      const newItem = JSON.parse(JSON.stringify(item));
      // try {
      //   newItem.scenario = (newItem.scenario ? JSON.parse(newItem.scenario) : []).slice(0, 3); // 取前三项
      // } catch {
      //   newItem.scenario = newItem.scenario.split(',').slice(0, 3);
      // }

      newItem.scenario = (newItem.scenario ? JSON.parse(newItem.scenario) : []).slice(0, 3); // 取前三项
      return newItem;
    });
  });

  // 点击卡片 ->  携带id跳转到 classes 页面
  const handleRouter = (item) => {
    const url = RouteChildEnum.MODELS_DETAIL;
    const params = { id: item.id };
    go(parseParam(url, params));
  };
</script>

<style lang="less" scoped>
  @import '/@/design/function/gridLayout.less';

  @height: 260px;
  @prefix-cls: ~'@{namespace}-modelsCard';
  .@{prefix-cls} {
    .gridLayoutCover( 295px, 20px);

    .card {
      position: relative;
      font-weight: 400;

      height: 100%;
      width: 100%;
      background: #fff;
      border: 1px solid #ccc;
      border-radius: 12px;
      padding: 15px 10px;

      cursor: pointer;

      &__header {
        display: flex;
        align-items: center;
        flex-direction: row;
        gap: 8px;
        height: 20px;
        margin-bottom: 10px;

        &--title {
          font-weight: 500; //font-weight: 600;

          font-size: 16px;
          line-height: 23px;
          color: #333;

          width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        &--type {
          // width: max-content;
          white-space: nowrap;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          height: 20px;
          padding: 2px 8px;
          font-size: 12px;
          color: #fff;
          border-radius: 4px;

          &.image {
            background: #fcb17a;
          }

          &.lidar {
            background: #86affe;
          }
        }
      }

      &__picture {
        // height: 106px;
        margin-bottom: 10px;

        div {
          width: 100%;
          padding-top: 33.3%;
          background-position: 50%;
          background-repeat: no-repeat;
          background-size: cover;
        }

        // img {
        //   width: 100%;
        //   height: 100%;
        //   object-fit: cover;
        // }
      }

      &__count {
        height: 16px;
        font-size: 14px;
        line-height: 16px;
        color: #666;

        margin-bottom: 10px;
      }

      &__tags {
        // height: 52px;
        display: flex;
        flex-wrap: wrap;
        align-content: space-between;
        gap: 8px;
        overflow: hidden;
        // line-height: 100%;

        & > div {
          font-size: 12px;
          color: #57ccef;

          display: flex;
          justify-content: center;
          align-items: center;
          height: 22px;
          padding: 4px 8px;
          border: 1px solid #57ccef;
          border-radius: 40px;
        }
      }

      &__type {
        position: absolute;
        left: 20px;
        top: 55px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        height: 20px;
        padding: 2px 8px;
        font-size: 12px;
        color: #fff;
        border-radius: 4px;

        &.image {
          background: #fcb17a;
        }

        &.lidar {
          background: #86affe;
        }
      }
    }
  }
</style>
