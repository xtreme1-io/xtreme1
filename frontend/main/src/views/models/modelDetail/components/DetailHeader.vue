<template>
  <div class="header">
    <div class="header__back" @click="goBack">
      <img src="../../../../assets/images/models/back.svg" alt="" />
      <span>{{ t('common.back') }}</span>
    </div>
    <div class="flex h-106px">
      <div class="header__image">
        <template v-if="hasType">
          <img v-if="isImage" src="../../../../assets/images/models/overviewImage.png" />
          <img v-else src="../../../../assets/images/models/overviewLidar.svg" />
        </template>
      </div>
      <div class="header__content">
        <div>
          <div class="type">
            <template v-if="hasType">
              <!-- <span v-if="isImage" class="image">{{ props.headerData.type }} </span>
              <span v-else class="lidar">{{ props.headerData.type }} </span> -->
              <span v-if="isImage" class="image">{{ t('business.dataset.image') }} </span>
              <span v-else class="lidar">
                {{ t('business.ontology.modal.datasetType.lidar') }}
              </span>
            </template>
          </div>
          <div class="title">{{ props.headerData.name || '' }}</div>
        </div>
        <div>
          <span>{{ t('business.models.detail.usage') + '：' }}</span>
          <div>
            <Progress
              style="width: 200px"
              :percent="headerData.quotaProgress"
              :strokeWidth="12"
              strokeColor="#57CCEF"
              trailColor="#aaa"
              :format="() => headerData.quotaText"
            />
          </div>
        </div>
        <div>
          <span>{{ t('business.models.detail.creator') + '：' }}</span>
          <span>{{ props.headerData.creator }}</span>
        </div>
        <div>
          <span>{{ t('business.models.detail.createTime') + '：' }}</span>
          <span>{{ getDate(props.headerData.createTime) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import { useGo } from '/@/hooks/web/usePage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getDate } from '/@/utils/business/timeFormater';
  import { RouteEnum } from '/@/enums/routeEnum';
  import { IHeader } from './typing';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';
  import { Progress } from 'ant-design-vue';

  const { t } = useI18n();

  const props = withDefaults(defineProps<{ headerData: IHeader }>(), {
    headerData: (): IHeader => {
      return {
        type: '',
        name: '',
        creator: '',
        createTime: new Date(),
        quotaProgress: 0,
        quotaText: '',
      };
    },
  });

  const hasType = computed(() => {
    return !!props.headerData.type;
  });

  const isImage = computed(() => {
    return props.headerData.type == datasetTypeEnum.IMAGE;
  });

  const go = useGo();
  const goBack = () => {
    go(`${RouteEnum.MODELS}`);
  };
</script>
<style lang="less" scoped>
  .header {
    display: flex;
    flex-direction: column;
    margin: 20px;
    height: 150px;

    &__back {
      width: 70px;
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      cursor: pointer;

      img {
        margin: 5px;
      }

      span {
        font-size: 18px;
        line-height: 21px;
        color: #57ccef;
        margin-left: 4px;
      }
    }

    &__image {
      width: 108px;
      height: 90px;

      img {
        width: 100%;
        height: 100%;
      }
    }

    &__content {
      margin-left: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;

      & > div {
        display: flex;
        align-items: center;
        font-size: 14px;
        line-height: 16px;
        color: #333;

        .type {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          height: 20px;

          span {
            padding: 2px 8px;
            font-size: 12px;
            color: #fff;
            border-radius: 4px;
            margin-right: 10px;
          }

          .image {
            background: #fcb17a;
          }

          .lidar {
            background: #86affe;
          }
        }

        .title {
          font-weight: 500; //font-weight: 600;

          font-size: 20px;
          line-height: 23px;
          height: 23px;
          color: #333333;
          white-space: nowrap;
        }
      }
    }
  }
</style>
